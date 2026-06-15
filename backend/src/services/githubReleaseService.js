const env = require('../config/env');

const headers = {
  'Authorization': `Bearer ${env.githubToken}`,
  'Accept': 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'FitJone-Release-Service'
};

/**
 * Creates a new GitHub Release
 * @param {string} versionName - e.g. "1.0.0"
 * @param {string} releaseNotes - Notes for the release description
 * @returns {Promise<Object>} Release details containing release ID and upload_url
 */
const createRelease = async (versionName, releaseNotes) => {
  const url = `https://api.github.com/repos/${env.githubOwner}/${env.githubRepo}/releases`;
  
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      tag_name: `v${versionName}`,
      name: `FitJone v${versionName}`,
      body: releaseNotes || '',
      draft: false,
      prerelease: false
    })
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(`Failed to create GitHub release: ${errData.message || res.statusText}`);
  }

  return res.json();
};

/**
 * Uploads an APK file buffer as a release asset
 * @param {string} releaseId - Target release ID
 * @param {Buffer} fileBuffer - APK binary buffer
 * @param {string} fileName - Asset file name (e.g. "FitJone-v1.0.0.apk")
 * @returns {Promise<Object>} Asset details containing asset ID and browser_download_url
 */
const uploadReleaseAsset = async (releaseId, fileBuffer, fileName) => {
  // Upload endpoint has a different base URL
  const url = `https://uploads.github.com/repos/${env.githubOwner}/${env.githubRepo}/releases/${releaseId}/assets?name=${fileName}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.githubToken}`,
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Length': fileBuffer.length.toString(),
      'User-Agent': 'FitJone-Release-Service'
    },
    body: fileBuffer
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(`Failed to upload GitHub release asset: ${errData.message || res.statusText}`);
  }

  return res.json();
};

/**
 * Deletes a GitHub Release by ID
 * @param {string} releaseId - The ID of the release to delete
 * @returns {Promise<void>}
 */
const deleteRelease = async (releaseId) => {
  const url = `https://api.github.com/repos/${env.githubOwner}/${env.githubRepo}/releases/${releaseId}`;

  const res = await fetch(url, {
    method: 'DELETE',
    headers
  });

  if (!res.ok && res.status !== 404) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(`Failed to delete GitHub release: ${errData.message || res.statusText}`);
  }
};

/**
 * Deletes a release asset by ID
 * @param {string} assetId - The ID of the asset to delete
 * @returns {Promise<void>}
 */
const deleteAsset = async (assetId) => {
  const url = `https://api.github.com/repos/${env.githubOwner}/${env.githubRepo}/releases/assets/${assetId}`;

  const res = await fetch(url, {
    method: 'DELETE',
    headers
  });

  if (!res.ok && res.status !== 404) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(`Failed to delete GitHub release asset: ${errData.message || res.statusText}`);
  }
};

/**
 * Retrieves the public browser download URL for an asset
 * @param {string} releaseId - Release ID (included for API consistency)
 * @param {string} assetId - Asset ID
 * @returns {Promise<string>} Full browser download URL
 */
const getDownloadURL = async (releaseId, assetId) => {
  const url = `https://api.github.com/repos/${env.githubOwner}/${env.githubRepo}/releases/assets/${assetId}`;

  const res = await fetch(url, {
    headers
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(`Failed to get download URL: ${errData.message || res.statusText}`);
  }

  const data = await res.json();
  return data.browser_download_url;
};

/**
 * Converts bytes into a readable MB string (e.g. 112197632 -> "107 MB")
 * @param {number} bytes - Number of bytes
 * @returns {string} Formatted file size
 */
const formatFileSize = (bytes) => {
  if (!bytes || isNaN(bytes)) return '0 MB';
  const megabytes = bytes / (1024 * 1024);
  return `${Math.round(megabytes)} MB`;
};

module.exports = {
  createRelease,
  uploadReleaseAsset,
  deleteRelease,
  deleteAsset,
  getDownloadURL,
  formatFileSize
};
