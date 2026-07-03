function escapeXml(text: string): string {
  return text.replace(/[<>&'"]/g, (char) => {
    switch (char) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return char;
    }
  });
}

export interface ImsManifestParams {
  identifier: string;
  title: string;
  files: string[];
}

export function generateImsManifest12({ identifier, title, files }: ImsManifestParams): string {
  const fileTags = files.map((file) => `      <file href="${escapeXml(file)}"/>`).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${escapeXml(identifier)}" version="1"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2">
  <organizations default="ORG-1">
    <organization identifier="ORG-1">
      <title>${escapeXml(title)}</title>
      <item identifier="ITEM-1" identifierref="RES-1">
        <title>${escapeXml(title)}</title>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="RES-1" type="webcontent" adlcp:scormtype="sco" href="index.html">
${fileTags}
    </resource>
  </resources>
</manifest>
`;
}
