import { useRef, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  FileInput,
  Group,
  ScrollArea,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import * as XLSX from "xlsx";

import {
  getCampaignPerformance,
  saveCampaignLeads,
} from "../../../services/campaignService";

const REQUIRED_COLUMNS = ["Lead Name"];

const EXPECTED_COLUMNS = [
  "Lead Name",
  "Company",
  "Email",
  "Phone",
  "Designation",
  "Source",
  "Status",
];

function normalizeHeader(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function normalizeEmail(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function normalizePhone(value) {
  return String(value || "")
    .trim()
    .replace(/[^\d+]/g, "");
}

function isValidEmail(email) {
  if (!email) return true;

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  if (!phone) return true;

  const digits = phone.replace(/\D/g, "");

  return digits.length >= 7 && digits.length <= 15;
}

function normalizeRow(row) {
  const normalized = {};

  Object.entries(row).forEach(([key, value]) => {
    const normalizedKey = normalizeHeader(key);

    const matchingColumn = EXPECTED_COLUMNS.find(
      (column) => normalizeHeader(column) === normalizedKey,
    );

    if (matchingColumn) {
      normalized[matchingColumn] =
        value === null || value === undefined ? "" : String(value).trim();
    }
  });

  return {
    leadName: normalized["Lead Name"] || "",
    company: normalized["Company"] || "",
    email: normalized["Email"] || "",
    phone: normalized["Phone"] || "",
    designation: normalized["Designation"] || "",
    source: normalized["Source"] || "",
    status: normalized["Status"] || "",
  };
}

function validateRows(rows) {
  const validRows = [];
  const invalidRows = [];

  const seenEmails = new Set();
  const seenPhones = new Set();

  rows.forEach((rawRow, index) => {
    const rowNumber = index + 2;
    const row = normalizeRow(rawRow);

    const errors = [];

    // Lead Name is required
    if (!row.leadName) {
      errors.push("Lead Name is required.");
    }

    // Email is optional, but validate if present
    if (row.email && !isValidEmail(row.email)) {
      errors.push("Invalid email format.");
    }

    // Phone is optional, but validate if present
    if (row.phone && !isValidPhone(row.phone)) {
      errors.push("Invalid phone number.");
    }

    // Duplicate email inside current file
    const email = normalizeEmail(row.email);

    if (email) {
      if (seenEmails.has(email)) {
        errors.push("Duplicate email in uploaded file.");
      } else {
        seenEmails.add(email);
      }
    }

    // Duplicate phone inside current file
    const phone = normalizePhone(row.phone);

    if (phone) {
      if (seenPhones.has(phone)) {
        errors.push("Duplicate phone number in uploaded file.");
      } else {
        seenPhones.add(phone);
      }
    }

    const validatedRow = {
      ...row,
      rowNumber,
      errors,
    };

    if (errors.length > 0) {
      invalidRows.push(validatedRow);
    } else {
      validRows.push(validatedRow);
    }
  });

  return {
    validRows,
    invalidRows,
  };
}

export default function CampaignUpload({
  campaign,
  performance,
  onUploadComplete,
}) {
  const inputRef = useRef(null);

  const [file, setFile] = useState(null);

  const [validRows, setValidRows] = useState([]);
  const [invalidRows, setInvalidRows] = useState([]);

  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleFileChange(selectedFile) {
    setFile(selectedFile);
    setValidRows([]);
    setInvalidRows([]);
    setError("");
    setSuccess("");

    if (!selectedFile) {
      return;
    }

    const fileName = selectedFile.name.toLowerCase();

    const isCSV = fileName.endsWith(".csv");
    const isExcel = fileName.endsWith(".xlsx") || fileName.endsWith(".xls");

    if (!isCSV && !isExcel) {
      setError("Invalid file type. Please upload a CSV or Excel file.");

      setFile(null);
      return;
    }

    try {
      setProcessing(true);

      const buffer = await selectedFile.arrayBuffer();

      const workbook = XLSX.read(buffer, {
        type: "array",
        cellDates: true,
      });

      if (!workbook.SheetNames.length) {
        throw new Error("The uploaded file contains no sheets.");
      }

      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

      const rows = XLSX.utils.sheet_to_json(firstSheet, {
        defval: "",
        raw: false,
      });

      if (!rows.length) {
        throw new Error("The uploaded file does not contain any data rows.");
      }

      // Validate required columns
      const originalHeaders = Object.keys(rows[0]);

      const normalizedHeaders = originalHeaders.map(normalizeHeader);

      const missingColumns = REQUIRED_COLUMNS.filter(
        (column) => !normalizedHeaders.includes(normalizeHeader(column)),
      );

      if (missingColumns.length > 0) {
        throw new Error(
          `Missing required column: ${missingColumns.join(", ")}`,
        );
      }

      const result = validateRows(rows);

      setValidRows(result.validRows);
      setInvalidRows(result.invalidRows);

      if (result.validRows.length === 0 && result.invalidRows.length > 0) {
        setError(
          "No valid rows were found. Please fix the invalid rows and upload the file again.",
        );
      }
    } catch (err) {
      setError(err.message || "Unable to process the uploaded file.");

      setValidRows([]);
      setInvalidRows([]);
    } finally {
      setProcessing(false);
    }
  }
  async function handleConfirmUpload() {
  if (!campaign) {
    setError("No campaign selected.");
    return;
  }

  if (!performance) {
    setError(
      "Please save the campaign performance before uploading leads."
    );
    return;
  }

  if (validRows.length === 0) {
    setError("There are no valid leads to upload.");
    return;
  }

  try {
    setSaving(true);
    setError("");
    setSuccess("");

    const result = await saveCampaignLeads({
      campaignId: campaign.id,
      performanceId: performance.id,
      leads: validRows,
    });

    const uploadedCount = result.leads.length;
const duplicateCount = result.duplicates?.length || 0;

let message = `${uploadedCount} new lead${
  uploadedCount === 1 ? "" : "s"
} uploaded successfully.`;

if (duplicateCount > 0) {
  message += ` ${duplicateCount} duplicate${
    duplicateCount === 1 ? "" : "s"
  } skipped.`;
}

setSuccess(message);

    setValidRows([]);
    setInvalidRows([]);
    setFile(null);

    onUploadComplete?.(result.performance);
  } catch (err) {
    setError(
      err.message || "Failed to save campaign leads."
    );
  } finally {
    setSaving(false);
  }
}

  function clearUpload() {
    setFile(null);
    setValidRows([]);
    setInvalidRows([]);
    setError("");
    setSuccess("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <Stack gap="md">
      <div>
        <Title order={4}>Positive Leads Upload</Title>

        <Text size="sm" c="dimmed" mt={4}>
          Upload the positive leads generated for this campaign and reporting
          month.
        </Text>
      </div>

      {campaign && (
        <Card withBorder>
          <Text size="sm">
            <strong>Campaign:</strong> {campaign.name}
          </Text>

          {performance && (
            <Text size="sm" mt={4}>
              <strong>Month:</strong>{" "}
              {new Date(`${performance.month}T00:00:00`).toLocaleDateString(
                "en-IN",
                {
                  month: "long",
                  year: "numeric",
                },
              )}
            </Text>
          )}
        </Card>
      )}

      <FileInput
        ref={inputRef}
        label="Upload CSV / Excel"
        placeholder="Choose .csv or .xlsx file"
        accept=".csv,.xlsx,.xls"
        value={file}
        onChange={handleFileChange}
        clearable
      />

      <Text size="xs" c="dimmed">
        Required column: Lead Name. Email and Phone are optional.
      </Text>

      {processing && <Alert color="blue">Processing file...</Alert>}

      {error && (
        <Alert color="red" title="Upload Error">
          {error}
        </Alert>
      )}

      {success && (
        <Alert color="green" title="Upload Complete">
          {success}
        </Alert>
      )}

      {(validRows.length > 0 || invalidRows.length > 0) && (
        <Card withBorder>
          <Group justify="space-between" mb="md">
            <Text fw={600}>Upload Preview</Text>

            <Group gap="xs">
              <Badge color="green">{validRows.length} Valid</Badge>

              <Badge color="red">{invalidRows.length} Invalid</Badge>
            </Group>
          </Group>

          <ScrollArea>
            <Table striped highlightOnHover withTableBorder miw={900}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Row</Table.Th>
                  <Table.Th>Lead Name</Table.Th>
                  <Table.Th>Company</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Phone</Table.Th>
                  <Table.Th>Designation</Table.Th>
                  <Table.Th>Source</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Validation</Table.Th>
                </Table.Tr>
              </Table.Thead>

              <Table.Tbody>
                {[...validRows, ...invalidRows].map((row) => (
                  <Table.Tr key={row.rowNumber}>
                    <Table.Td>{row.rowNumber}</Table.Td>

                    <Table.Td>{row.leadName || "-"}</Table.Td>

                    <Table.Td>{row.company || "-"}</Table.Td>

                    <Table.Td>{row.email || "-"}</Table.Td>

                    <Table.Td>{row.phone || "-"}</Table.Td>

                    <Table.Td>{row.designation || "-"}</Table.Td>

                    <Table.Td>{row.source || "-"}</Table.Td>

                    <Table.Td>{row.status || "-"}</Table.Td>

                    <Table.Td>
                      {row.errors.length === 0 ? (
                        <Badge color="green">Valid</Badge>
                      ) : (
                        <Text size="xs" c="red" maw={220}>
                          {row.errors.join(" ")}
                        </Text>
                      )}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Card>
      )}

      <Group justify="flex-end">
        <Button
          variant="default"
          onClick={clearUpload}
          disabled={!file && validRows.length === 0 && invalidRows.length === 0}
        >
          Clear
        </Button>

        <Button
          loading={saving}
          disabled={
            validRows.length === 0 ||
            invalidRows.length > 0 ||
            processing ||
            !campaign ||
            !performance
          }
          onClick={handleConfirmUpload}
        >
          Confirm Upload
        </Button>
      </Group>
    </Stack>
  );
}
