const UAParser = require('ua-parser-js');
const geoip = require('geoip-lite');

/**
 * Parses a user-agent string and extracts browser, OS, and device type.
 * @param {string} uaString - The raw User-Agent header value
 * @returns {{ browser: string, os: string, deviceType: string }}
 */
const parseUserAgent = (uaString) => {
  const parser = new UAParser(uaString);

  return {
    browser: parser.getBrowser().name || 'Unknown',
    os: parser.getOS().name || 'Unknown',
    deviceType: parser.getDevice().type || 'desktop', // defaults to desktop if unknown
  };
};

/**
 * Resolves an IP address to a country name using the geoip-lite database.
 * @param {string} ip - The client IP address
 * @returns {string} Country code or descriptive fallback
 */
const getCountryFromIP = (ip) => {
  // Handle localhost / loopback addresses
  if (!ip || ip === '::1' || ip === '::ffff:127.0.0.1' || ip === '127.0.0.1') {
    return 'Local';
  }

  try {
    const geo = geoip.lookup(ip);
    return (geo && geo.country) || 'Unknown';
  } catch {
    return 'Unknown';
  }
};

/**
 * Extracts the real client IP from the request, accounting for proxies.
 * @param {import('express').Request} req
 * @returns {string} The client's IP address
 */
const getClientIP = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    // x-forwarded-for may contain a comma-separated list; take the first entry
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.connection.remoteAddress || 'Unknown';
};

module.exports = { parseUserAgent, getCountryFromIP, getClientIP };
