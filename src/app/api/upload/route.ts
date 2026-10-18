import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    // Suporte para envio em JSON (Base64 data URL)
    if (contentType.includes('application/json')) {
      const body = await req.json();
      if (!body.imageData) {
        return NextResponse.json({ error: 'Nenhuma imagem enviada' }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        url: body.imageData, // Retorna o base64 para preview imediato e persistência
        message: 'Upload concluído com sucesso',
      });
    }

    // Suporte para FormData multipart
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    // Converte o arquivo para Buffer/Base64 para persistência imediata
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || 'image/png';
    const base64Url = `data:${mimeType};base64,${buffer.toString('base64')}`;

    return NextResponse.json({
      success: true,
      url: base64Url,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (error: any) {
    console.error('Erro na rota de upload:', error);
    return NextResponse.json(
      { error: error?.message || 'Falha ao processar upload da imagem' },
      { status: 500 }
    );
  }
}
