import csv
import json
import os
import re
from typing import List, Dict, Any

class MedicalDataPreprocessor:
    def __init__(self, data_dir: str):
        self.data_dir = data_dir
        
    def clean_text(self, text: str) -> str:
        """Clean and normalize text fields"""
        if not text:
            return ""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        return text

    def read_csv_file(self, file_path: str) -> List[Dict[str, str]]:
        """Read CSV file to list of dicts"""
        data = []
        try:
            with open(file_path, 'r', encoding='utf-8-sig', errors='replace') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    data.append(row)
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
        return data

    def clean_icd11_data(self, input_file: str) -> List[Dict[str, Any]]:
        """Process ICD-11 CSV file"""
        file_path = os.path.join(self.data_dir, input_file)
        print(f"Processing ICD-11 data from {file_path}...")
        
        raw_data = self.read_csv_file(file_path)
        processed_data = []
        
        for row in raw_data:
            # 1. Filter out rows with 'Problem' (validation errors)
            if row.get('Problem'):
                continue
                
            # 2. Filter out invalid codes
            code = row.get('Code', '')
            if not code or code == '#NAME?':
                continue
                
            # 3. Normalize
            clean_name = self.clean_text(row.get('Name', ''))
            clean_synonyms = self.clean_text(row.get('Synonyms', ''))
            
            # FIX: Handle Excel #NAME? error
            if not clean_name or clean_name == '#NAME?':
                # Try to extract from synonyms
                if clean_synonyms:
                    # Strategy 1: Look for English term marked with (TM2)
                    tm2_match = re.search(r'([a-zA-Z\s\-\(\)]+)\(TM2\)', clean_synonyms)
                    if tm2_match:
                        clean_name = tm2_match.group(1).strip()
                    else:
                        # Strategy 2: Take the first synonym (often (a) SanskritName)
                        # Remove (a), (b), (c) markers
                        first_syn = clean_synonyms.split(',')[0]
                        clean_name = re.sub(r'\([abc]\)', '', first_syn).strip()
                else:
                    clean_name = "Unknown Term"

            # 4. Create unified structure
            # Sanitize ID for Pinecone (ASCII only)
            safe_code = re.sub(r'[^a-zA-Z0-9_-]', '', code)
            
            record = {
                'id': f"ICD11_{safe_code}",
                'code': code,
                'source': 'ICD-11',
                'primary_term': clean_name,
                'definition': '', 
                'synonyms': clean_synonyms,
                'category': 'modern_medicine',
                'original_data': row
            }
            processed_data.append(record)
            
        print(f"Successfully processed {len(processed_data)} ICD-11 records")
        return processed_data

    def clean_namaste_data(self, input_file: str) -> List[Dict[str, Any]]:
        """Process NAMASTE CSV file"""
        file_path = os.path.join(self.data_dir, input_file)
        print(f"Processing NAMASTE data from {file_path}...")
        
        # Use CSV version instead of Excel to avoid openpyxl dependency
        if input_file.endswith('.xls') or input_file.endswith('.xlsx'):
            # Try to find the CSV version if Excel is passed
            csv_path = file_path.replace('.xls', '_CSV.csv').replace('.xlsx', '_CSV.csv')
            if os.path.exists(csv_path):
                file_path = csv_path
                print(f"Switched to CSV version: {file_path}")
            else:
                # Fallback: try to read the specific CSV we know exists
                known_csv = os.path.join(self.data_dir, "NATIONAL AYURVEDA MORBIDITY CODES (1) - Copy_CSV.csv")
                if os.path.exists(known_csv):
                    file_path = known_csv
                    print(f"Switched to known CSV version: {file_path}")
        
        raw_data = self.read_csv_file(file_path)
        processed_data = []
        
        for row in raw_data:
            # Normalize keys (strip whitespace)
            row = {k.strip(): v for k, v in row.items() if k}
            
            # Identify columns
            # NAMC_CODE, NAMC_term, Short_definition, Name English Under Index
            code = row.get('NAMC_CODE') or row.get('NAMCCode') or row.get('NAMS_CODE')
            term = row.get('NAMC_term') or row.get('Name English') or row.get('TERM_NAME')
            desc = row.get('Short_definition') or row.get('Long_definition') or row.get('DESCRIPTION')
            syn = row.get('Name English Under Index') or row.get('SYNONYMS')
            
            if not code or not term:
                continue
            
            # Sanitize ID for Pinecone (ASCII only)
            safe_code = re.sub(r'[^a-zA-Z0-9_-]', '', code)
                
            record = {
                'id': f"NAMASTE_{safe_code}",
                'code': code,
                'source': 'NAMASTE',
                'primary_term': self.clean_text(term),
                'definition': self.clean_text(desc),
                'synonyms': self.clean_text(syn),
                'category': 'ayurveda',
                'original_data': row
            }
            processed_data.append(record)
            
        print(f"Successfully processed {len(processed_data)} NAMASTE records")
        return processed_data

if __name__ == "__main__":
    # Configuration
    # Using absolute paths to the original data
    ORIGINAL_DATA_DIR = r"c:/Users/admin/Downloads/aryan/BACKEND/BACKUP/SIH-WORKING-2/SIH/BACKEND/src/data"
    OUTPUT_DIR = r"c:/Users/admin/Downloads/aryan/BACKEND/BACKUP/SIH-WORKING-2/SIH/ML_SERVICE/data"
    
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    preprocessor = MedicalDataPreprocessor(ORIGINAL_DATA_DIR)
    
    # Process files
    icd_data = preprocessor.clean_icd11_data("icd_with_synonyms_and_problems_2_CSV.csv")
    namaste_data = preprocessor.clean_namaste_data("NATIONAL AYURVEDA MORBIDITY CODES (1).xls")
    
    # Merge
    if icd_data or namaste_data:
        unified_data = icd_data + namaste_data
        
        output_file = os.path.join(OUTPUT_DIR, "unified_medical_corpus.jsonl")
        
        with open(output_file, 'w', encoding='utf-8') as f:
            for record in unified_data:
                f.write(json.dumps(record, ensure_ascii=False) + '\n')
                
        print(f"Total records: {len(unified_data)}")
        print(f"Saved to {output_file}")
    else:
        print("Failed to process datasets")
