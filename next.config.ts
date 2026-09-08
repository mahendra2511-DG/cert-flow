import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  async redirects() {
    return [
      { source: "/certifications/amazon-web-services", destination: "/certifications/aws", permanent: true },
      { source: "/certifications/amazon-web-services/:exam", destination: "/certifications/aws/:exam", permanent: true },
      { source: "/certifications/azure-fundamentals", destination: "/certifications/microsoft/az-900", permanent: true },
      { source: "/certifications/azure-administrator", destination: "/certifications/microsoft/az-104", permanent: true },
      { source: "/certifications/microsoft-365-fundamentals", destination: "/certifications/microsoft/ms-900", permanent: true },
      { source: "/certifications/aws-solutions-architect-associate", destination: "/certifications/aws/saa-c03", permanent: true },
      { source: "/certifications/aws-cloud-practitioner", destination: "/certifications/aws/clf-c02", permanent: true },
      { source: "/certifications/google-cloud-associate-engineer", destination: "/certifications/google-cloud/ace", permanent: true },
      { source: "/certifications/ccna", destination: "/certifications/cisco/200-301", permanent: true },
      { source: "/certifications/security-plus", destination: "/certifications/comptia/sy0-701", permanent: true },
      { source: "/certifications/network-plus", destination: "/certifications/comptia/n10-009", permanent: true },
      { source: "/certifications/certified-kubernetes-administrator", destination: "/certifications/cloud-native/cka", permanent: true },
    ];
  },
};

export default nextConfig;
