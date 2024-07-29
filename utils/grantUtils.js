export function extractFields(text) {
    const pattern = /^(?<Name>.*?)\n\s*Sectors:\s*(?<Sectors>.*?)\n\s*Industry:\s*(?<Industry>.*?)\n\s*Brief:\s*(?<Brief>.*?)\n\s*Applications\s*open\s*till\s*[:-]\s*(?<Applications_open_till>.*?)\n\s*Benefits:\s*(?<Benefits>.*?)(?=\n\s*Notes\s*:\s*|\n\s*Links\s*to\s*application\s*:\s*|\Z)(?:Notes:\s*(?<Notes>.*?))?\n\s*Links\s*to\s*application\s*:\s*(?<Links_to_application>.*)/s;
  
    const match = text.match(pattern);
    if (match) {
      const fields = match.groups;
      for (const key in fields) {
        if (fields[key]) {
          fields[key] = fields[key].trim();
        }
      }
      return fields;
    } else {
      return null;
    }
  }