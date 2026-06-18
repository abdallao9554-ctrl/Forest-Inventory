import axios from "axios";

const SENTINEL_AUTH_URL = "https://services.sentinel-hub.com/oauth/token";
const SENTINEL_URL = "https://services.sentinel-hub.com/process/v1";

export async function getAccessToken(clientId: string, clientSecret: string) {
    try {
        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');
        params.append('client_id', clientId);
        params.append('client_secret', clientSecret);

        const response = await axios.post(SENTINEL_AUTH_URL, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        return response.data.access_token;
    } catch (error) {
        console.error('Error fetching Sentinel Hub access token:', error);
        throw new Error('Failed to authenticate with Sentinel Hub');
    }
}

export async function getRemoteSensingIndex(aoi: any, from: string, to: string, token: string, index: string) {
  let evalscript = "";
  let bands: string[] = [];

  switch (index) {
    case 'EVI':
      bands = ["B02", "B04", "B08"];
      evalscript = `
        //VERSION=3
        function setup() {
          return {
            input: ["B02", "B04", "B08"],
            output: { bands: 1, sampleType: "FLOAT32" }
          };
        }
        function evaluatePixel(sample) {
          let evi = 2.5 * ((sample.B08 - sample.B04) / (sample.B08 + 6 * sample.B04 - 7.5 * sample.B02 + 1));
          return [evi];
        }
      `;
      break;
    case 'NDMI':
      bands = ["B08", "B11"];
      evalscript = `
        //VERSION=3
        function setup() {
          return {
            input: ["B08", "B11"],
            output: { bands: 1, sampleType: "FLOAT32" }
          };
        }
        function evaluatePixel(sample) {
          let ndmi = (sample.B08 - sample.B11) / (sample.B08 + sample.B11);
          return [ndmi];
        }
      `;
      break;
    case 'NBR':
      bands = ["B08", "B12"];
      evalscript = `
        //VERSION=3
        function setup() {
          return {
            input: ["B08", "B12"],
            output: { bands: 1, sampleType: "FLOAT32" }
          };
        }
        function evaluatePixel(sample) {
          let nbr = (sample.B08 - sample.B12) / (sample.B08 + sample.B12);
          return [nbr];
        }
      `;
      break;
    default: // NDVI
      bands = ["B04", "B08"];
      evalscript = `
        //VERSION=3
        function setup() {
          return {
            input: ["B04", "B08"],
            output: { bands: 1, sampleType: "FLOAT32" }
          };
        }
        function evaluatePixel(sample) {
          let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
          return [ndvi];
        }
      `;
  }

  const response = await axios.post(
    SENTINEL_URL,
    {
      input: {
        bounds: {
          geometry: aoi
        },
        data: [
          {
            type: "sentinel-2-l2a",
            dataFilter: {
              timeRange: {
                from: from,
                to: to
              }
            }
          }
        ]
      },
      output: {
        width: 512,
        height: 512,
        responses: [{ identifier: "default", format: { type: "image/tiff" } }]
      },
      evalscript
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      responseType: "arraybuffer"
    }
  );

  return response.data;
}
