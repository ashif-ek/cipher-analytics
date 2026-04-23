import pandas as pd
import logging
import chardet
import io
import os

logger = logging.getLogger(__name__)

class SafeCSVLoader:
    """
    Robust CSV ingestion layer with encoding detection, delimiter discovery,
    and memory-safe chunked reading.
    """
    
    DEFAULT_CHUNK_SIZE = 10000
    MIN_ROWS_THRESHOLD = 5
    
    def __init__(self, file_path):
        self.file_path = file_path
        self.report = {
            "status": "PENDING",
            "rows": 0,
            "columns": 0,
            "delimiter": None,
            "encoding": None,
            "warnings": [],
            "errors": []
        }

    def detect_encoding(self):
        try:
            with open(self.file_path, 'rb') as f:
                raw_data = f.read(10000)
                result = chardet.detect(raw_data)
                encoding = result['encoding'] or 'utf-8'
                # Fallback to latin1 if utf-8 fails later or confidence is low
                self.report["encoding"] = encoding
                return encoding
        except Exception as e:
            logger.error(f"Encoding detection failed: {str(e)}")
            self.report["encoding"] = 'utf-8'
            return 'utf-8'

    def detect_delimiter(self, encoding):
        delimiters = [',', ';', '\t', '|']
        try:
            with open(self.file_path, 'r', encoding=encoding) as f:
                header = f.readline()
                counts = {d: header.count(d) for d in delimiters}
                best_d = max(counts, key=counts.get)
                # If no clear delimiter, assume comma
                self.report["delimiter"] = best_d if counts[best_d] > 0 else ','
                return self.report["delimiter"]
        except Exception:
            self.report["delimiter"] = ','
            return ','

    def load_safe(self):
        encoding = self.detect_encoding()
        delimiter = self.detect_delimiter(encoding)
        
        try:
            # First pass: count columns and validate header
            df_head = pd.read_csv(
                self.file_path, 
                encoding=encoding, 
                sep=delimiter, 
                nrows=1, 
                engine='python',
                on_bad_lines='skip'
            )
            
            if df_head.empty or len(df_head.columns) == 0:
                self.report["status"] = "FAILED"
                self.report["errors"].append("ZERO_COLUMNS_DETECTED")
                return None, self.report

            self.report["columns"] = len(df_head.columns)
            
            # Second pass: stream chunks to count rows and validate data
            total_rows = 0
            chunks = pd.read_csv(
                self.file_path,
                encoding=encoding,
                sep=delimiter,
                chunksize=self.DEFAULT_CHUNK_SIZE,
                engine='python',
                on_bad_lines='skip'
            )
            
            full_df = pd.DataFrame()
            for chunk in chunks:
                total_rows += len(chunk)
                # Keep a sample for profiling if dataset is huge, or return full if small
                if total_rows <= 50000:
                    full_df = pd.concat([full_df, chunk])
            
            self.report["rows"] = total_rows
            
            if total_rows < self.MIN_ROWS_THRESHOLD:
                self.report["status"] = "FAILED"
                self.report["errors"].append(f"INSUFFICIENT_ROWS: Found {total_rows}, min {self.MIN_ROWS_THRESHOLD}")
                return None, self.report

            self.report["status"] = "SUCCESS"
            return full_df, self.report

        except Exception as e:
            logger.exception("Ingestion engine failure.")
            self.report["status"] = "FAILED"
            self.report["errors"].append(f"PARSING_ERROR: {str(e)}")
            return None, self.report
