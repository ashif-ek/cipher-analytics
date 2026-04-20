from dataclasses import dataclass
from typing import List, Any, Optional
from enum import Enum

class FilterOperator(Enum):
    EQ = "EQ"
    GT = "GT"
    LT = "LT"
    IN = "IN"

@dataclass
class Filter:
    field: str
    operator: FilterOperator
    value: Any

class OperationType(Enum):
    AGGREGATE = "AGGREGATE"
    CUSTOM = "CUSTOM"

@dataclass
class Operation:
    type: OperationType
    field: str
    filters: Optional[List[Filter]] = None

# Mandatory Query Templates for Aggregated Mode
ALLOWED_QUERIES = ["total_count", "average_value", "sum_field"]
