import mammoth from 'mammoth';
import pdf from 'pdf-parse';

export async function extractTextFromFile(
  fileType: string,
  buffer: Buffer,
): Promise<string | null> {
  try {
    if (fileType === 'application/pdf') {
      const data = await pdf(buffer);
      return data.text;
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const { value } = await mammoth.extractRawText({ buffer });
      return value;
    } else if (fileType.startsWith('text/')) {
      return buffer.toString('utf-8');
    }
    return null;
  } catch (error) {
    console.error(`Failed to parse file of type ${fileType}:`, error);
    return null;
  }
}
