  import React, { useEffect, useState, useRef } from "react";
  import { Button, Input, Modal, Select } from "antd";
  import { DownloadOutlined } from "@ant-design/icons";
  import { useDropzone } from "react-dropzone";
  import * as XLSX from "xlsx";
  import { TabulatorFull as Tabulator } from "tabulator-tables";
  import Maps from "./Maps";
  import "./App.css";
  import { Bar, Pie } from "react-chartjs-2";
  import "chart.js/auto";
  import Title from "antd/es/skeleton/Title";

  function App() {
    const [fileItems, setFileItems] = useState([]);
    const [isAddDataModalVisible, setAddDataModalVisible] = useState(false);
    const [isTableLoaded, setTableLoaded] = useState(false);
    const [isEditDataModalVisible, setEditDataModalVisible] = useState(false);
    const [isPieChartVisible, setPieChartVisible] = useState(false);
    const [isBarChartVisible, setBarChartVisible] = useState(false);
    const [editData, setEditData] = useState(null);
    const [statusValue, setStatusValue] = useState("");
    const { getRootProps, getInputProps, open, acceptedFiles } = useDropzone({
      noClick: true,
      noKeyboard: true,
    });
    const tabulatorTableRef = useRef(null);
    const lenInputRef = useRef(null);
    const [mapWKT, setMapWKT] = useState("");
    const [isMapVisible, setMapVisible] = useState(false);

    const [pieChartData, setPieChartData] = useState({
      labels: ["Status 0", "Status 1", "Status 2"],
      datasets: [
        {
          data: [0, 0, 0],
          backgroundColor: ["#FF5733", "#33FF55", "#3366FF"],
        },
      ],
    });

    const [barChartData, setBarChartData] = useState({
      labels: ["Status 0", "Status 1", "Status 2"],
      datasets: [
        {
          data: [0, 0, 0],
          backgroundColor: ["#FF5733", "#33FF55", "#3366FF"],
        },
      ],
    });

    const openMap = (wkt) => {
      setMapWKT(wkt);
      setMapVisible(true);
    };

    const handleAddRow = () => {
      const lenValue = lenInputRef.current.input.value;

      if (!lenValue || !statusValue) {
        alert("Please fill in both Len and Status fields.");
        return;
      }
      const largestId = Math.max(...fileItems.map((item) => item.id), 0);
      const newRow = {
        id: largestId + 1,
        len: lenValue,
        status: statusValue,
      };

      tabulatorTableRef.current.addRow(newRow, "top");
      closeAddDataModal();
    };

    const handleDeleteRow = (id) => {
      const idToDelete = parseInt(id, 10);
      const rowData = tabulatorTableRef.current.getData();
      const updatedData = rowData.filter((row) => row.id !== idToDelete);
      tabulatorTableRef.current.setData(updatedData);
    };

    const handleEditRow = () => {
      if (editData) {
        const updatedData = fileItems.map((item) =>
          item.id === editData.id ? editData : item
        );
        setFileItems(updatedData);
        tabulatorTableRef.current.updateData(updatedData);
        setEditDataModalVisible(false);
      }
    };

    const convertXLSXToJson = (workbook) => {
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);
      return jsonData;
    };

    const handleAnaliz1Click = () => {
      if (isTableLoaded) {
        const statusCounts = [0, 0, 0];
        const totalDataCount = fileItems.length;

        fileItems.forEach((item) => {
          const status = parseInt(item.status, 10);
          if (!isNaN(status) && status >= 0 && status <= 2) {
            statusCounts[status]++;
          }
        });

        const piePercentages = statusCounts.map((count, index) => {
          const percentage = ((count / totalDataCount) * 100).toFixed(2);
          return `Status ${index} (${percentage}%)`;
        });

        const newPieChartData = {
          labels: piePercentages,
          datasets: [
            {
              data: statusCounts,
              backgroundColor: ["#FF5733", "#33FF55", "#3366FF"],
            },
          ],
        };

        setPieChartData(newPieChartData);
        setPieChartVisible(true);
      } else {
        alert("Please load the table first.");
      }
    };

    const handleAnaliz2Click = () => {
      if (isTableLoaded) {
        const lenSums = [0, 0, 0];

        fileItems.forEach((item) => {
          const status = parseInt(item.status, 10);
          if (!isNaN(status) && status >= 0 && status <= 2) {
            lenSums[status] += parseFloat(item.len);
          }
        });

        const newBarChartData = {
          labels: ["Status 0", "Status 1", "Status 2"],
          datasets: [
            {
              label: "Status 0",
              data: [lenSums[0], 0, 0],
              backgroundColor: ["#FF5733"],
            },
            {
              label: "Status 1",
              data: [0, lenSums[1], 0],
              backgroundColor: ["#33FF55"],
            },
            {
              label: "Status 2",
              data: [0, 0, lenSums[2]],
              backgroundColor: ["#3366FF"],
            },
          ],
        };

        setBarChartData(newBarChartData);
        setBarChartVisible(true);
      } else {
        alert("Please load the table first.");
      }
    };

    const openAddDataModal = () => {
      setAddDataModalVisible(true);
    };

    const closeAddDataModal = () => {
      setAddDataModalVisible(false);
    };

    const openEditDataModal = (id) => {
      const dataToEdit = fileItems.find((item) => item.id === id);
      setEditData(dataToEdit);
      setEditDataModalVisible(true);
    };

    const closeEditDataModal = () => {
      setEditDataModalVisible(false);
      setEditData(null);
    };

    useEffect(() => {
      const extractIdFromFiles = (files) => {
        const extractedData = files.map((file, index) => ({
          id: file.id,
          len: file.len,
          wkt: file.wkt,
          status: file.status,
        }));
        setFileItems(extractedData.sort((a, b) => b.id - a.id));

        const tabulatorTable = new Tabulator("#example-table", {
          pagination: "local",
          paginationSize: 100,
          paginationSizeSelector: [50, 25, true],
          height: "300",
          data: extractedData,
          layout: "fitDataFill",
          columns: [
            {
              title: "id",
              field: "id",
              width: 150,
              headerFilter: "input",
            },
            {
              title: "len",
              field: "len",
              hozAlign: "left",
              width: 150,
              headerFilter: "input",
            },
            {
              title: "wkt",
              field: "wkt",
              width: 170,
              headerFilter: "input",
            },
            {
              title: "status",
              field: "status",
              width: 150,
              headerFilter: "input",
            },
            {
              field: "delete",
              width: 100,
              formatter: "buttonCross",
              cellClick: (e, cell) => {
                const id = cell.getRow().getData().id;
                handleDeleteRow(id);
              },
              hozAlign: "center",
            },
            {
              field: "edit",
              width: 100,
              hozAlign: "center",
              formatter: edittIcon,
              cellClick: (e, cell) => {
                const id = cell.getRow().getData().id;
                openEditDataModal(id);
              },
            },
            {
              field: "open",
              width: 100,
              hozAlign: "center",
              formatter: printIcon,
              cellClick: (e, cell) => {
                const wkt = cell.getRow().getData().wkt;
                openMap(wkt);
              },
            },
          ],
        });
        tabulatorTableRef.current = tabulatorTable;
        setTableLoaded(true);
      };

      var printIcon = function () {
        return "<i class='fa-solid fa-location-dot'></i>";
      };

      var edittIcon = function () {
        return "<i class='fa-solid fa-pen-to-square'></i>";
      };

      if (acceptedFiles.length > 0) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: "array" });
          const jsonData = convertXLSXToJson(workbook);
          extractIdFromFiles(jsonData);
        };
        reader.readAsArrayBuffer(acceptedFiles[0]);
      }
    }, [acceptedFiles]);

    return (
      <div className="container">
        <div className="buttons">
          <div className="upload-file">
            <div {...getRootProps({ className: "dropzone" })}>
              <input {...getInputProps()} />
              <Button
                className="button"
                onClick={open}
                type="primary"
                icon={<DownloadOutlined />}
                size="large"
              >
                Load Excel File
              </Button>
            </div>
          </div>
          <Button
            className="button"
            type="primary"
            icon={<DownloadOutlined />}
            size="large"
            onClick={openAddDataModal}
          >
            Add New Data
          </Button>
        </div>
        <Modal
          title="Add New Data"
          open={isAddDataModalVisible}
          onOk={handleAddRow}
          onCancel={closeAddDataModal}
        >
          <div>
            <div>
              <h3>Len bilgisi girin</h3>
              <Input ref={lenInputRef} />
            </div>
            <div>
              <h3>Status seçiniz</h3>
              <Select
                value={statusValue}
                defaultValue="Status"
                style={{ width: 100 }}
                options={[
                  { value: "0", label: "0" },
                  { value: "1", label: "1" },
                  { value: "2", label: "2" },
                ]}
                onChange={(value) => setStatusValue(value)}
              />
            </div>
          </div>
        </Modal>

        <Modal
          title="Edit Data"
          open={isEditDataModalVisible}
          onOk={handleEditRow}
          onCancel={closeEditDataModal}
        >
          <div>
            <div>
              {editData && (
                <>
                  <Input value={editData.id} disabled />
                  <Input
                    value={editData.len}
                    onChange={(e) =>
                      setEditData({ ...editData, len: e.target.value })
                    }
                  />
                  <Input value={editData.wkt} disabled />
                  <Input
                    value={editData.status}
                    onChange={(e) =>
                      setEditData({ ...editData, status: e.target.value })
                    }
                  />
                </>
              )}
            </div>
          </div>
        </Modal>

        <div className="table">
          <div id="example-table"></div>
          {isMapVisible && <Maps wkt={mapWKT} />}
        </div>
        <div className="analiz">
          <Button
            onClick={handleAnaliz1Click}
            className="button"
            type="primary"
            size="large"
          >
            Analiz 1
          </Button>
          <Button
            onClick={handleAnaliz2Click}
            className="button"
            type="primary"
            size="large"
          >
            Analiz 2
          </Button>
        </div>
        {isPieChartVisible && (
          <div className="pie-chart">
            <Pie data={pieChartData} />
          </div>
        )}
        {isBarChartVisible && (
          <div className="bar-chart">
            <Bar data={barChartData} />
          </div>
        )}
      </div>
    );
  }

  export default App;
