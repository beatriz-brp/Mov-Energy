document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.getElementById("start-camera");
  const readerElement = document.getElementById("reader");
  const resultElement = document.getElementById("result");
  let html5QrCode;

function onScanSuccess(decodedText, decodedResult) {
  resultElement.innerText = `QR Code detectado: ${decodedText}`;

  // Verifica se é uma URL válida (simples)
  if (decodedText.startsWith("http://") || decodedText.startsWith("https://")) {
    window.location.href = decodedText; // Redireciona para a URL
  } else {
    // Caso seja um texto comum
    html5QrCode.stop().then(() => {
      console.log("Scanner parado após leitura.");
    }).catch(err => console.error("Erro ao parar scanner:", err));
  }
}


  startButton.addEventListener("click", async () => {
    startButton.disabled = true;
    readerElement.style.display = "block";
    resultElement.innerText = "Aguardando leitura...";

    try {
      const cameras = await Html5Qrcode.getCameras();
      if (cameras.length === 0) {
        resultElement.innerText = "Nenhuma câmera encontrada.";
        startButton.disabled = false;
        return;
      }

      const cameraId = cameras[0].id;
      html5QrCode = new Html5Qrcode("reader");

      await html5QrCode.start(
        cameraId,
        { fps: 10, qrbox: 250 },
        onScanSuccess,
        (errorMessage) => {
          // Ignorar falhas contínuas de leitura
        }
      );
    } catch (err) {
      resultElement.innerText =
        "Erro ao acessar a câmera. Verifique as permissões.";
      console.error(err);
      startButton.disabled = false;
    }
  });
});

