import { useState, useRef, useEffect } from "react";
import { GalleryProvider, useGallery } from "../context/GalleryContext";
import FileUpload from "../components/FileUpload";
import ImageDisplay from "../components/ImageDisplay";
import Logo from "../components/ui/Logo";
import { useRouter } from "next/router";
import axiosInstance from "../lib/axiosInstance";
import Cookies from "js-cookie";

export default function Home() {
  const [showMore, setShowMore] = useState(false);
  const sectionRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (showMore && sectionRef.current) {
      const sectionBottom = sectionRef.current.getBoundingClientRect().bottom + window.pageYOffset;
      window.scrollTo({
        top: sectionBottom,
        behavior: 'smooth'
      });
    }
  }, [showMore]);

  const handleLogout = async () => {
    try {
      console.log("Starting logout process...");
      
      // Call the logout API endpoint using the configured axios instance
      // The server will handle clearing the HttpOnly cookie
      const response = await axiosInstance.post("/api/logout");
      console.log("Logout API response:", response.data);
      
      // Clear the auth token from localStorage
      localStorage.removeItem('auth_token');
      console.log("Cleared auth_token from localStorage");
      
      // Show success message
      alert("Logout efetuado com sucesso!");
      
      // Add a small delay before redirecting to ensure the cookie is processed
      console.log("Redirecting to home page in 500ms...");
      setTimeout(() => {
        // Force a full page reload to ensure all state is cleared
        window.location.href = "/";
      }, 500);
    } catch (error) {
      console.error("Error during logout:", error);
      alert("Erro ao efetuar logout. Por favor, tente novamente.");
    }
  };

  return (
    <GalleryProvider>
      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
        {/* Header with Logo and Logout Button */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginBottom: "20px"
        }}>
          <Logo />
          <button
            onClick={handleLogout}
            style={{
              background: "#dc3545",
              color: "#fff",
              border: "none",
              padding: "8px 15px",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              transition: "background-color 0.3s ease"
            }}
            onMouseOver={(e) => e.currentTarget.style.background = "#c82333"}
            onMouseOut={(e) => e.currentTarget.style.background = "#dc3545"}
          >
            Logout
          </button>
        </div>

        {/* Componente de Upload de Ficheiros */}
        <FileUpload />
        <hr />

        {/* Galeria de Imagens */}
        <ImageDisplay />
        <br />
        <hr />

        {/* Secção de Explicação */}
        <section
          ref={sectionRef}
          style={{
            background: "#f9f9f9",
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "15px",
            marginBottom: "20px",
            fontSize: "14px",
            lineHeight: "1.4em",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            width: showMore ? "100%" : "200px",
            margin: showMore ? "20px 0" : "20px auto",
            transition: "width 0.3s ease-in-out"
          }}
        >
          {showMore && (            
            <div>
              <h2 style={{ marginTop: 0, color: "#333", fontSize: "16px" }}>O que é a IPFS e a Blockchain?</h2>
              <p style={{ color: "#555" }}>
                A <strong>IPFS</strong> (InterPlanetary File System) permite armazenar ficheiros de forma descentralizada na Blockchain, distribuindo
                os dados por uma rede de computadores (nós), em vez de depender de um único servidor centralizado como
                em servidores da Google ou da Amazon.
              </p>
              <h2 style={{ marginTop: "20px", color: "#333", fontSize: "16px" }}>Como funciona?</h2>
              <p style={{ color: "#555" }}>
                A <strong>blockchain</strong> regista o identificador único dos ficheiros, chamado
                <strong> hash (CID)</strong>, que é devidamente encriptado, garantindo a integridade e referência ao ficheiro original.
              </p>
              <p style={{ color: "#555" }}>
                Quando um ficheiro é <strong>"removido" o vinculo direto entre o nó (referência do Hash/CID - Content identifier) e o ficheiro é eliminado (unpinned)</strong>, ele deixa de estar armazenado no nó responsável,
                mas o hash continua a existir na blockchain. Esse processo permite a remoção eficiente do ficheiro sem comprometer a descentralização.
              </p>
              <h3 style={{ marginTop: "20px", color: "#333", fontSize: "16px" }}>Vantagens de armazenar na Blockchain:</h3>
              <ul style={{ marginLeft: "20px", color: "#555" }}>
                <li>
                  <strong>Segurança e disponibilidade:</strong> Os ficheiros são distribuídos por uma rede global, tornando-os
                  imunes a ataques ou bloqueios centralizados.
                </li>
                <li>
                  <strong>Imutabilidade e segurança:</strong> Uma vez registados na blockchain, os hashes (CID) não podem
                  ser alterados ou apagados, garantindo integridade.
                </li>
                <li>
                  <strong>Controlo total pelo utilizador:</strong> O utilizador detém a chave de acesso e controlo sobre
                  os ficheiros, ao contrário dos sistemas centralizados.
                </li>
                <li>
                  <strong>Alta disponibilidade:</strong> Na descentralização, mesmo em caso de falhas em partes da rede, os ficheiros continuam
                  acessíveis devido à sua distribuição global. No caso de falha de um servidor centralizado, os ficheiros podem ficar comprometidos e/ou totalmente inacessíveis.
                </li>
                <li>
                  <strong>Transparência:</strong> Todas as operações são públicas e verificáveis, aumentando a confiança e
                  a segurança dos dados.
                </li>
              </ul>

              <h3 style={{ fontSize: "16px", marginTop: "15px", color: "#333" }}>
                Possibilidade de camadas complementares de privacidade e controlo:
              </h3>
              <ul style={{ marginLeft: "20px", color: "#555" }}>
                <li>Encriptação antes do upload para garantir privacidade do conteúdo.</li>
                <li>Monitorização e remoção proativa para evitar cópias indesejadas.</li>
                <li>Redes IPFS privadas para maior controlo e exclusividade.</li>
                <li>Gateways privados com autenticação para limitar o acesso.</li>
              </ul>
              <p style={{ color: "#555" }}>
                Essas estratégias garantem maior segurança e controlo dos ficheiros na Blockchain no ecossistema IPFS.
              </p>
            </div>
          )}
          <div style={{ 
            display: "flex", 
            justifyContent: showMore ? "flex-start" : "center"
          }}>
            <button
              onClick={() => setShowMore(!showMore)}
              style={{
                marginTop: "10px",
                background: "#007BFF",
                color: "#fff",
                border: "none",
                padding: "5px 10px",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              {showMore ? "Entendido!" : "Como funciona?"}
            </button>
          </div>
        </section>

      </div>
    </GalleryProvider>
  );
}