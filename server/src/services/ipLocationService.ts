import type { Request } from "express";
import { env } from "../utils/env.js";

type IpApiResponse = {
  city?: string;
  region?: string;
  country_name?: string;
  latitude?: number;
  longitude?: number;
};

export type ResolvedLocation = {
  source: "ip" | "default";
  location: string;
  coordinates: {
    lat: string;
    lon: string;
  };
};

export async function resolveLocationFromRequest(req: Request): Promise<ResolvedLocation> {
  const ip = getClientIp(req);

  if (ip && !isLocalIp(ip)) {
    try {
      const response = await fetch(`https://ipapi.co/${ip}/json/`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(4000)
      });

      if (response.ok) {
        const data = (await response.json()) as IpApiResponse;

        if (data.latitude && data.longitude) {
          return {
            source: "ip",
            location: formatLocation(data),
            coordinates: {
              lat: String(data.latitude),
              lon: String(data.longitude)
            }
          };
        }
      }
    } catch {
      // Fall through to the configured default location.
    }
  }

  return {
    source: "default",
    location: env.defaultLocationName,
    coordinates: {
      lat: env.defaultLat,
      lon: env.defaultLon
    }
  };
}

function getClientIp(req: Request) {
  const forwardedFor = req.headers["x-forwarded-for"];
  const forwardedIp = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor?.split(",")[0]?.trim();

  return forwardedIp || req.socket.remoteAddress || req.ip;
}

function isLocalIp(ip: string) {
  return (
    ip === "::1" ||
    ip === "127.0.0.1" ||
    ip.startsWith("::ffff:127.") ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)
  );
}

function formatLocation(data: IpApiResponse) {
  return [data.city, data.region, data.country_name].filter(Boolean).join(", ") || env.defaultLocationName;
}
