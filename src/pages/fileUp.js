import { useState, useRef, useEffect } from "react";
import { GalleryProvider } from "../context/GalleryContext";
import FileUpload from "../components/FileUpload";
import ImageDisplay from "../components/ImageDisplay";
import axiosInstance from "../lib/axiosInstance";
import Cookies from 'js-cookie';
import Logo from "../components/ui/Logo";

export default function Home() {
  const [showMore, setShowMore] = useState(false);
  const sectionRef = useRef(null);

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
      
      // Clear browser cookies using js-cookie
      console.log("Clearing browser cookies with js-cookie...");
      Cookies.remove('token'); // Basic removal
      Cookies.remove('token', { path: '/' }); // With path
      
      // Try with specific domain
      try {
        Cookies.remove('token', { path: '/', domain: '.nstech.pt' });
        console.log("Removed cookie with domain .nstech.pt");
      } catch (e) {
        console.log("Error removing cookie with domain .nstech.pt:", e);
      }
      
      // Try with current domain
      try {
        const currentDomain = window.location.hostname;
        Cookies.remove('token', { path: '/', domain: currentDomain });
        console.log(`Removed cookie with domain ${currentDomain}`);
      } catch (e) {
        console.log(`Error removing cookie with domain ${window.location.hostname}:`, e);
      }
      
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
      <div className="p-4 md:p-6 font-sans">
        {/* Header with Logo and Logout Button */}
        <div className="flex justify-between items-center mb-6">
          <div className="w-32 md:w-40">
            <Logo />
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-semibold shadow-sm transition-colors duration-200"
          >
            Logout
          </button>
        </div>

        {/* File Upload Component */}
        <div className="w-full max-w-3xl mx-auto">
          <FileUpload />
        </div>
        <hr className="my-6" />

        {/* Image Gallery */}
        <ImageDisplay />
        <hr className="my-6" />

        {/* Explanation Section */}
        <section
          ref={sectionRef}
          className={`bg-gray-50 border border-gray-200 rounded-lg p-4 md:p-6 mb-6 text-sm leading-relaxed shadow-md transition-all duration-300 ${
            showMore ? 'w-full' : 'w-48 md:w-64 mx-auto'
          }`}
        >
          {showMore && (            
            <div className="space-y-4">
              <h2 className="mt-0 text-gray-800 text-lg font-semibold">O que é a IPFS e a Blockchain?</h2>
              <p className="text-gray-600">
                A <strong>IPFS</strong> (InterPlanetary File System) permite armazenar ficheiros de forma descentralizada na Blockchain, distribuindo
                os dados por uma rede de computadores (nós), em vez de depender de um único servidor centralizado como
                em servidores da Google ou da Amazon.
              </p>
              <h2 className="mt-4 text-gray-800 text-lg font-semibold">Como funciona?</h2>
              <p className="text-gray-600">
                A <strong>blockchain</strong> regista o identificador único dos ficheiros, chamado
                <strong> hash (CID)</strong>, que é devidamente encriptado, garantindo a integridade e referência ao ficheiro original.
              </p>
              <p className="text-gray-600">
                Quando um ficheiro é <strong>"removido" o vinculo direto entre o nó (referência do Hash/CID - Content identifier) e o ficheiro é eliminado (unpinned)</strong>, ele deixa de estar armazenado no nó responsável,
                mas o hash continua a existir na blockchain. Esse processo permite a remoção eficiente do ficheiro sem comprometer a descentralização.
              </p>
              <h3 className="mt-4 text-gray-800 text-lg font-semibold">Vantagens de armazenar na Blockchain:</h3>
              <ul className="list-disc text-gray-600 pl-6">
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

              <h3 className="mt-4 text-gray-800 text-lg font-semibold">
                Possibilidade de camadas complementares de privacidade e controlo:
              </h3>
              <ul className="list-disc text-gray-600 pl-6">
                <li>Encriptação antes do upload para garantir privacidade do conteúdo.</li>
                <li>Monitorização e remoção proativa para evitar cópias indesejadas.</li>
                <li>Redes IPFS privadas para maior controlo e exclusividade.</li>
                <li>Gateways privados com autenticação para limitar o acesso.</li>
              </ul>
              <p className="text-gray-600">
                Essas estratégias garantem maior segurança e controlo dos ficheiros na Blockchain no ecossistema IPFS.
              </p>
            </div>
          )}
          {!showMore && (
            <div className="text-center">
              <button
                onClick={() => setShowMore(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors duration-200"
              >
                Como funciona?
              </button>
            </div>
          )}
        </section>
      </div>
    </GalleryProvider>
  );
}