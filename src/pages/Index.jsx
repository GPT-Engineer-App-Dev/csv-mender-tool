import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { CSVLink } from 'react-csv';
import { Table } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [csvData, setCsvData] = useState([]);
  const [headers, setHeaders] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    Papa.parse(file, {
      complete: (results) => {
        setHeaders(results.data[0]);
        setCsvData(results.data.slice(1));
      },
      header: false,
    });
  }, []);

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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">CSV Editor</h1>
      
      <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4 text-center cursor-pointer">
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the CSV file here ...</p>
        ) : (
          <p>Drag 'n' drop a CSV file here, or click to select a file</p>
        )}
      </div>

      {csvData.length > 0 && (
        <>
          <div className="overflow-x-auto mb-4">
            <Table>
              <thead>
                <tr>
                  {headers.map((header, index) => (
                    <th key={index} className="px-4 py-2">{header}</th>
                  ))}
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {csvData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-2">
                        <Input
                          value={cell}
                          onChange={(e) => handleEdit(rowIndex, cellIndex, e.target.value)}
                          className="w-full"
                        />
                      </td>
                    ))}
                    <td className="px-4 py-2">
                      <Button onClick={() => handleDeleteRow(rowIndex)} variant="destructive">Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          <div className="flex justify-between mb-4">
            <Button onClick={handleAddRow}>Add Row</Button>
            <CSVLink
              data={[headers, ...csvData]}
              filename="edited_data.csv"
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
            >
              Download CSV
            </CSVLink>
          </div>
        </>
      )}
    </div>
  );
};

export default Index;
