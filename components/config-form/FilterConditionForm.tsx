"use client";

import { useState, useMemo } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Stack,
  Button,
  Box,
} from "@mui/material";
import type {
  FilterCondition,
  DatabaseWithProperties,
  TextFilterOperator,
  NumberFilterOperator,
  SelectFilterOperator,
  StatusFilterOperator,
  DateFilterOperator,
  CheckboxFilterOperator,
  CheckboxFilterCondition,
} from "@/types/notion";

interface FilterConditionFormProps {
  properties: DatabaseWithProperties["properties"];
  onAdd: (condition: FilterCondition) => void;
  onCancel: () => void;
}

const TEXT_OPERATORS: TextFilterOperator[] = [
  "equals",
  "contains",
  "is_empty",
  "is_not_empty",
];

const NUMBER_OPERATORS: NumberFilterOperator[] = [
  "equals",
  "greater_than",
  "less_than",
  "is_empty",
  "is_not_empty",
];

const SELECT_OPERATORS: SelectFilterOperator[] = [
  "equals",
  "is_empty",
  "is_not_empty",
];

const STATUS_OPERATORS: StatusFilterOperator[] = [
  "equals",
  "is_empty",
  "is_not_empty",
];

const DATE_OPERATORS: DateFilterOperator[] = [
  "equals",
  "before",
  "after",
  "is_empty",
  "is_not_empty",
];

const CHECKBOX_OPERATORS: CheckboxFilterOperator[] = ["equals"];

function getOperatorsForType(
  type: string
):
  | TextFilterOperator[]
  | NumberFilterOperator[]
  | SelectFilterOperator[]
  | StatusFilterOperator[]
  | DateFilterOperator[]
  | CheckboxFilterOperator[] {
  switch (type) {
    case "rich_text":
    case "title":
      return TEXT_OPERATORS;
    case "number":
      return NUMBER_OPERATORS;
    case "select":
      return SELECT_OPERATORS;
    case "status":
      return STATUS_OPERATORS;
    case "date":
    case "created_time":
    case "last_edited_time":
      return DATE_OPERATORS;
    case "checkbox":
      return CHECKBOX_OPERATORS;
    default:
      return [];
  }
}

function needsValue(operator: string): boolean {
  return operator !== "is_empty" && operator !== "is_not_empty";
}

export default function FilterConditionForm({
  properties,
  onAdd,
  onCancel,
}: FilterConditionFormProps) {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [operator, setOperator] = useState<string>("");
  const [value, setValue] = useState<string>("");
  const [checkboxValue, setCheckboxValue] = useState<boolean>(false);

  const selectedProperty = useMemo(() => {
    return properties.find((p) => p.id === selectedPropertyId);
  }, [properties, selectedPropertyId]);

  const availableOperators = useMemo(() => {
    if (!selectedProperty) return [];
    return getOperatorsForType(selectedProperty.type);
  }, [selectedProperty]);

  const filteredProperties = useMemo(() => {
    const supportedTypes = [
      "rich_text",
      "title",
      "number",
      "select",
      "status",
      "date",
      "created_time",
      "last_edited_time",
      "checkbox",
    ];
    return properties.filter((p) => supportedTypes.includes(p.type));
  }, [properties]);

  const handleOperatorChange = (newOperator: string) => {
    setOperator(newOperator);
    if (!needsValue(newOperator)) {
      setValue("");
      setCheckboxValue(false);
    }
  };

  const handleSubmit = () => {
    if (!selectedProperty || !operator) return;

    const condition: FilterCondition = {
      propertyId: selectedProperty.id,
      propertyType: selectedProperty.type,
      operator: operator,
    } as FilterCondition;

    if (selectedProperty.type === "checkbox") {
      condition.value = checkboxValue;
    } else if (needsValue(operator)) {
      if (selectedProperty.type === "number") {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          return;
        }
        condition.value = numValue;
      } else {
        condition.value = value;
      }
    }

    onAdd(condition);
    setSelectedPropertyId("");
    setOperator("");
    setValue("");
    setCheckboxValue(false);
  };

  const isValid = useMemo(() => {
    if (!selectedProperty || !operator) return false;
    if (!needsValue(operator)) return true;
    if (selectedProperty.type === "checkbox") return true;
    if (selectedProperty.type === "number") {
      return value !== "" && !isNaN(parseFloat(value));
    }
    return value !== "";
  }, [selectedProperty, operator, value]);

  return (
    <Box
      sx={{
        p: 2,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
      }}
    >
      <Stack direction="column" gap={2}>
        <FormControl fullWidth size="small">
          <InputLabel>Property</InputLabel>
          <Select
            value={selectedPropertyId}
            label="Property"
            onChange={(e) => {
              setSelectedPropertyId(e.target.value);
              setOperator("");
              setValue("");
              setCheckboxValue(false);
            }}
          >
            {filteredProperties.map((prop) => (
              <MenuItem key={prop.id} value={prop.id}>
                {prop.name} ({prop.type})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedProperty && (
          <FormControl fullWidth size="small" disabled={!selectedPropertyId}>
            <InputLabel>Operator</InputLabel>
            <Select
              value={operator}
              label="Operator"
              onChange={(e) => handleOperatorChange(e.target.value)}
            >
              {availableOperators.map((op) => (
                <MenuItem key={op} value={op}>
                  {op.replace(/_/g, " ")}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {selectedProperty &&
          operator &&
          needsValue(operator) &&
          selectedProperty.type === "checkbox" && (
            <FormControl fullWidth size="small">
              <InputLabel>Value</InputLabel>
              <Select
                value={checkboxValue ? "true" : "false"}
                label="Value"
                onChange={(e) => setCheckboxValue(e.target.value === "true")}
              >
                <MenuItem value="true">True</MenuItem>
                <MenuItem value="false">False</MenuItem>
              </Select>
            </FormControl>
          )}

        {selectedProperty &&
          operator &&
          needsValue(operator) &&
          selectedProperty.type !== "checkbox" && (
            <TextField
              fullWidth
              size="small"
              label="Value"
              type={
                selectedProperty.type === "number"
                  ? "number"
                  : selectedProperty.type === "date"
                    ? "date"
                    : "text"
              }
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          )}

        <Stack direction="row" gap={1} justifyContent="flex-end">
          <Button size="small" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={handleSubmit}
            disabled={!isValid}
          >
            Add Filter
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
