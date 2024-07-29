import { NextResponse } from 'next/server';
import { Workbook } from 'exceljs';
import { GoogleGenerativeAI } from '@google/generative-ai'
import { extractFields } from '../../../utils/grantUtils';

export async function POST(req) {
  try {
    const data = await req.formData();
    const apiKey = data.get('apiKey');
    const file = data.get('file');

    if (!file || !apiKey) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const fileBuffer = await file.arrayBuffer();

    const generateAI = new GoogleGenerativeAI(apiKey)
    const model = generateAI.getGenerativeModel({ model: 'gemini-1.0-pro-latest' });

    const workbook = new Workbook();
    await workbook.xlsx.load(fileBuffer);
    const worksheet = workbook.getWorksheet(1);

    // Process each grant
    for (const [key, value] of data.entries()) {
      if (key.startsWith('grantName')) {
        const grantName = value;

        const prompt = `Hello, I am looking for funding opportunities and I am putting all of the grants in an excel sheet, would it be okay for you to tell me about the grant, once you have been given the grant name in the specified format, which is Name:
        Find the info from wherever you can, do not insert placeholder text, it is a very important document, and you are a Funding expert.
        If you have no information about the grant, put info like this for another grant you know of. Do not use any Asteriks, or anything else, just pure content, in the format you are asked.
        DO NOT USE ANY SYMBOL IN THE FORMAT YOU ARE ASKED, ALL THE FIELDS SHOULD BE MENTIONED EXACTLY LIKE YOU ARE ASKED. OTHERWISE IT WILL BREAK THE REGEX CODE.

        Sectors:
        Industry:
        Brief:
        Applications open till:
        Benefits:
        Notes:
        Links to application:
        The name of the grant is ${grantName}, if it is not a grant, include the information in the way I told you, and put these remarks in the notes, do not deviate from the format. in no case.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text();

        const extractedData = extractFields(responseText);

        if (extractedData) {
          worksheet.addRow([
            extractedData.Name,
            extractedData.Sectors,
            extractedData.Industry,
            extractedData.Brief,
            extractedData.Applications_open_till,
            extractedData.Benefits,
            extractedData.Notes,
            extractedData.Links_to_application,
          ]);
        }
      }
    }

    const updatedBuffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(updatedBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=updated_grants_data.xlsx',
      },
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}