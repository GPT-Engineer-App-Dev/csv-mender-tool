import React, { useState, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { CSVLink } from 'react-csv';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Table } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Index = () => {
  const [csvData, setCsvData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    Papa.parse(file, {
      complete: (results) => {
        setHeaders(results.data[0]);
        setCsvData(results.data.slice(1));
        // Set default X and Y axes
        setXAxis(results.data[0][0]);
        setYAxis(results.data[0][1]);
      },
      header: false,
    });
  }, []);

  const numericalColumns = useMemo(() => {
    return headers.filter((header, index) => 
      csvData.every(row => !isNaN(parseFloat(row[index])))
    );
  }, [headers, csvData]);

  const chartData = useMemo(() => {
    const xIndex = headers.indexOf(xAxis);
    const yIndex = headers.indexOf(yAxis);
    return csvData.map(row => ({
      [xAxis]: row[xIndex],
      [yAxis]: parseFloat(row[yIndex])
    }));
  }, [csvData, headers, xAxis, yAxis]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleEdit = (rowIndex, columnIndex, value) => {
    const newData = [...csvData];
    newData[rowIndex][columnIndex] = value;
    setCsvData(newData);
  };

  const handleAddRow = () => {
    const newRow = new Array(headers.length).fill('');
    setCsvData([...csvData, newRow]);
  };

  const handleDeleteRow = (rowIndex) => {
    const newData = csvData.filter((_, index) => index !== rowIndex);
    setCsvData(newData);
  };

  return (
    <div className="container mx-auto p-4 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">CSV Editor</h1>
      
      <div {...getRootProps()} className="border-2 border-dashed border-gray-400 rounded-lg p-6 mb-6 text-center cursor-pointer bg-gray-200 hover:bg-gray-300 transition-colors">
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-gray-700">Drop the CSV file here ...</p>
        ) : (
          <p className="text-gray-700">Drag 'n' drop a CSV file here, or click to select a file</p>
        )}
      </div>

      {csvData.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="overflow-x-auto mb-6">
            <Table>
              <thead className="bg-gray-200">
                <tr>
                  {headers.map((header, index) => (
                    <th key={index} className="px-4 py-3 text-left text-gray-700">{header}</th>
                  ))}
                  <th className="px-4 py-3 text-left text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {csvData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-3 border-t border-gray-200">
                        <Input
                          value={cell}
                          onChange={(e) => handleEdit(rowIndex, cellIndex, e.target.value)}
                          className="w-full bg-gray-50 focus:bg-white"
                        />
                      </td>
                    ))}
                    <td className="px-4 py-3 border-t border-gray-200">
                      <Button onClick={() => handleDeleteRow(rowIndex)} variant="destructive" className="bg-red-500 hover:bg-red-600">Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          <div className="flex justify-between mt-6 mb-8">
            <Button onClick={handleAddRow} className="bg-gray-600 hover:bg-gray-700 text-white">Add Row</Button>
            <CSVLink
              data={[headers, ...csvData]}
              filename="edited_data.csv"
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Download CSV
            </CSVLink>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Graph Visualization</h2>
            <div className="flex space-x-4 mb-4">
              <Select onValueChange={setXAxis} value={xAxis}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select X-Axis" />
                </SelectTrigger>
                <SelectContent>
                  {headers.map((header) => (
                    <SelectItem key={header} value={header}>{header}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select onValueChange={setYAxis} value={yAxis}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Y-Axis" />
                </SelectTrigger>
                <SelectContent>
                  {numericalColumns.map((header) => (
                    <SelectItem key={header} value={header}>{header}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={xAxis} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey={yAxis} stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
