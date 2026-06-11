/**
 * Bunny.net Storage Client — Phase 5
 * 
 * Handles uploading files directly from the browser to Bunny.net Edge Storage.
 */

const API_KEY = import.meta.env.VITE_BUNNY_API_KEY
const STORAGE_ZONE = import.meta.env.VITE_BUNNY_STORAGE_ZONE

// Storage endpoint (defaults to global, can be overridden via VITE_BUNNY_STORAGE_ENDPOINT for regional zones)
const STORAGE_ENDPOINT = import.meta.env.VITE_BUNNY_STORAGE_ENDPOINT || 'https://storage.bunnycdn.com'

export interface UploadResult {
  success: boolean
  message: string
  path?: string
}

/**
 * Uploads a file (Blob or Uint8Array) to Bunny Storage.
 * @param fileData The file data to upload
 * @param filename The name of the file
 * @param folder The target folder (e.g., 'Tipografia', 'Generativo', 'Logo', 'Transição')
 */
export async function uploadToBunny(
  fileData: Blob | Uint8Array,
  filename: string,
  folder: string
): Promise<UploadResult> {
  if (!API_KEY || !STORAGE_ZONE) {
    console.error('Bunny.net credentials are not configured in .env')
    return { success: false, message: 'Missing credentials' }
  }

  const path = `${folder}/${filename}`
  const url = `${STORAGE_ENDPOINT}/${STORAGE_ZONE}/${path}`

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'AccessKey': API_KEY,
        'Content-Type': fileData instanceof Blob ? fileData.type : 'application/octet-stream',
      },
      body: fileData as any
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Upload failed with status ${response.status}: ${errorText}`)
    }

    return { 
      success: true, 
      message: 'Upload successful', 
      path: `https://${STORAGE_ZONE}.b-cdn.net/${path}` // Assuming pull zone matches storage zone name
    }

  } catch (error: any) {
    console.error('Bunny Storage Error:', error)
    return { success: false, message: error.message || 'Unknown error during upload' }
  }
}

export interface BunnyAsset {
  ObjectName: string;
  Path: string;
  IsDirectory: boolean;
  LastChanged: string;
  Length: number;
}

export async function fetchBunnyAssets(folder: string): Promise<BunnyAsset[]> {
  if (!API_KEY || !STORAGE_ZONE) return [];

  const url = `${STORAGE_ENDPOINT}/${STORAGE_ZONE}/${folder}/`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'AccessKey': API_KEY,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) return []; // Folder might not exist yet
      throw new Error(`Fetch failed with status ${response.status}`);
    }

    return await response.json() as BunnyAsset[];
  } catch (error) {
    console.error('Bunny Storage Fetch Error:', error);
    return [];
  }
}

