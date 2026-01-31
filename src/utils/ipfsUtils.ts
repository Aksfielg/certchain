import toast from 'react-hot-toast';

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_API_SECRET = import.meta.env.VITE_PINATA_API_SECRET;
const PINATA_GATEWAY_URL = 'https://gateway.pinata.cloud/ipfs/';

async function pinataFetch(url: string, options: RequestInit) {
  const headers = {
    'pinata_api_key': PINATA_API_KEY,
    'pinata_secret_api_key': PINATA_API_SECRET,
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('Pinata API Error:', errorData);
    throw new Error(`Pinata API request failed: ${response.statusText}`);
  }

  return response.json();
}

export async function uploadToIPFS(file: File): Promise<string> {
  try {
    toast.loading('Uploading to IPFS...', { id: 'ipfs-upload' });

    const formData = new FormData();
    formData.append('file', file);

    const response = await pinataFetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      body: formData,
    });

    toast.success('File uploaded to IPFS successfully!', { id: 'ipfs-upload' });
    return response.IpfsHash;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    toast.error('Failed to upload to IPFS', { id: 'ipfs-upload' });
    throw error;
  }
}

export async function uploadJSONToIPFS(data: any, filename = 'certificate.json'): Promise<string> {
  try {
    const file = new File([JSON.stringify(data, null, 2)], filename, { type: 'application/json' });
    return await uploadToIPFS(file);
  } catch (error) {
    console.error('Error uploading JSON to IPFS:', error);
    throw error;
  }
}

export async function retrieveFromIPFS(cid: string): Promise<any> {
  try {
    toast.loading('Retrieving from IPFS...', { id: 'ipfs-retrieve' });

    const response = await fetch(`${PINATA_GATEWAY_URL}${cid}`);
    const data = await response.json();

    toast.success('Retrieved from IPFS successfully!', { id: 'ipfs-retrieve' });
    return data;
  } catch (error) {
    console.error('Error retrieving from IPFS:', error);
    toast.error('Failed to retrieve from IPFS', { id: 'ipfs-retrieve' });
    throw error;
  }
}

export function getIPFSGatewayURL(cid: string): string {
  return `${PINATA_GATEWAY_URL}${cid}`;
}

export default {
  uploadToIPFS,
  uploadJSONToIPFS,
  retrieveFromIPFS,
  getIPFSGatewayURL,
};