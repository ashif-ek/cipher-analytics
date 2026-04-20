from enum import Enum

class Visibility(Enum):
    PRIVATE = "PRIVATE"
    DISCOVERABLE = "DISCOVERABLE"

class ComputeMode(Enum):
    STRICT = "STRICT"
    WHITELIST = "WHITELIST"
    AGGREGATED = "AGGREGATED"

class OperationType(Enum):
    SUM = "SUM"
    MEAN = "MEAN"
    COUNT = "COUNT"
    VARIANCE = "VARIANCE"
    STDEV = "STDEV"

class AuthAction(Enum):
    VIEW = "VIEW"
    COMPUTE = "COMPUTE"
    DECRYPT = "DECRYPT"
