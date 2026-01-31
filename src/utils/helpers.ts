/**
 * Truncates an Ethereum address for display purposes
 * @param address The full Ethereum address
 * @returns Truncated address (e.g., 0x1234...5678)
 */
export const truncateAddress = (address: string | null): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Formats a date string to a more readable format
 * @param dateString Date string to format
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

/**
 * Converts a file to base64 string
 * @param file File to convert
 * @returns Promise resolving to base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

/**
 * Gets the file extension from a filename
 * @param filename The filename
 * @returns The file extension
 */
export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
};

/**
 * Validates if an Ethereum address is valid
 * @param address Ethereum address to validate
 * @returns Boolean indicating if address is valid
 */
export const isValidEthereumAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Formats a number with commas for thousands
 * @param num Number to format
 * @returns Formatted number string
 */
export const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/**
 * Generates a random token ID for testing purposes
 * @returns Random token ID between 1 and 1000000
 */
export const generateRandomTokenId = (): number => {
  return Math.floor(Math.random() * 1000000) + 1;
};

/**
 * Check if a string is valid JSON
 * @param str String to check
 * @returns Boolean indicating if string is valid JSON
 */
export const isValidJSON = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Parse CSV file content to array of objects
 * @param content CSV content
 * @param headers CSV headers (optional)
 * @returns Array of objects representing the CSV data
 */
export const parseCSV = (content: string, headers?: string[]): Record<string, string>[] => {
  const lines = content.trim().split('\n');
  
  // If headers are not provided, use the first line as headers
  const csvHeaders = headers || lines[0].split(',').map(header => header.trim());
  const dataLines = headers ? lines : lines.slice(1);
  
  return dataLines.map(line => {
    const values = line.split(',').map(value => value.trim());
    return csvHeaders.reduce((obj, header, index) => {
      obj[header] = values[index] || '';
      return obj;
    }, {} as Record<string, string>);
  });
};