class QRScanner {
      constructor() {
        this.startButton = document.getElementById("start-camera");
        this.readerElement = document.getElementById("reader");
        this.resultElement = document.getElementById("result");
        this.html5QrCode = null;
        this.isScanning = false;
        
        this.init();
      }

      init() {
        this.startButton.addEventListener("click", () => this.toggleScanner());
        this.setupAnimations();
      }

      setupAnimations() {
        // Add entrance animations
        const elements = document.querySelectorAll('.scanner-container > *');
        elements.forEach((el, index) => {
          el.style.animationDelay = `${0.1 * index}s`;
        });
      }

      async toggleScanner() {
        if (this.isScanning) {
          await this.stopScanner();
        } else {
          await this.startScanner();
        }
      }

      async startScanner() {
        this.startButton.disabled = true;
        this.startButton.innerHTML = '<div class="loading"></div>Carregando...';
        this.readerElement.classList.add('active');
        this.updateResult("Inicializando câmera...", "waiting");

        try {
          const cameras = await Html5Qrcode.getCameras();
          
          if (cameras.length === 0) {
            throw new Error("Nenhuma câmera encontrada");
          }

          // Preferir câmera traseira
          const preferredCamera = cameras.find(camera => 
            camera.label.toLowerCase().includes('back') || 
            camera.label.toLowerCase().includes('environment')
          ) || cameras[0];

          this.html5QrCode = new Html5Qrcode("reader");

          const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          };

          await this.html5QrCode.start(
            preferredCamera.id,
            config,
            (decodedText) => this.onScanSuccess(decodedText),
            (errorMessage) => {
              // Silenciar erros contínuos de scan
            }
          );

          this.isScanning = true;
          this.startButton.innerHTML = 'Parar Scanner';
          this.startButton.disabled = false;
          this.updateResult("Escaneando... Aponte para o QR Code", "waiting");

        } catch (error) {
          console.error("Erro ao iniciar scanner:", error);
          this.updateResult(`Erro: ${error.message}. Verifique as permissões da câmera.`, "error");
          this.startButton.innerHTML = 'Iniciar Scanner';
          this.startButton.disabled = false;
          this.readerElement.classList.remove('active');
        }
      }

      async stopScanner() {
        if (this.html5QrCode && this.isScanning) {
          try {
            await this.html5QrCode.stop();
            this.html5QrCode.clear();
            this.html5QrCode = null;
          } catch (error) {
            console.error("Erro ao parar scanner:", error);
          }
        }

        this.isScanning = false;
        this.startButton.innerHTML = 'Iniciar Scanner';
        this.startButton.disabled = false;
        this.readerElement.classList.remove('active');
        this.updateResult("Scanner parado", "waiting");
      }

      onScanSuccess(decodedText) {
        this.updateResult(`QR Code detectado: ${decodedText}`, "success");

        // Verificar se é URL válida
        if (this.isValidUrl(decodedText)) {
          setTimeout(() => {
            this.updateResult("Redirecionando...", "success");
            setTimeout(() => {
              window.location.href = decodedText;
            }, 1000);
          }, 1500);
        } else {
          // Para texto comum, parar o scanner após alguns segundos
          setTimeout(() => {
            this.stopScanner();
          }, 3000);
        }
      }

      isValidUrl(string) {
        try {
          new URL(string);
          return string.startsWith("http://") || string.startsWith("https://");
        } catch (_) {
          return false;
        }
      }

      updateResult(message, type) {
        this.resultElement.className = type;
        this.resultElement.textContent = message;
      }
    }

    // Initialize when DOM is loaded
    document.addEventListener("DOMContentLoaded", () => {
      new QRScanner();
    });

    // Mobile menu toggle
    document.querySelector('.hamburger')?.addEventListener('click', function() {
      this.classList.toggle('open');
      document.querySelector('.nav').classList.toggle('active');
    });