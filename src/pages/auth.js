import { useState, useEffect, useRef } from "react"; // Importação dos hooks do React
import { useRouter } from "next/router"; // Routeamento do Next.js
import Head from "next/head"; // Importação do Head para SEO
import { ToastContainer, toast } from "react-toastify"; // Importação do Toastify - Mensagens de erro
import "react-toastify/dist/ReactToastify.css"; // Estilos do Toastify
import useMessages from "../hooks/useMessages"; // Hook para mensagens dinâmicas
import Input from "../components/ui/Input"; // Componente Input
import Button from "../components/ui/Button"; // Componente Button
import Logo from "../components/ui/Logo"; // Componente Logo
import Image from "next/image"; // Componente Image
import { FiAlertTriangle } from "react-icons/fi"; // Ícone de erro
import axiosInstance from "../lib/axiosInstance"; // 🚀 Importação do axiosInstance
import Loading from "../components/ui/Loading"; // Componente de Loading
//import PwaInstallButton from "@/components/PwaInstallButton";

export default function Auth() {
  const messages = useMessages(); // Hook para carregar mensagens dinâmicas
  const [formData, setFormData] = useState({ email: "", password: "" }); // Estado do formulário
  const router = useRouter();
  const emailInputRef = useRef(null);
  const [dbStatus, setDbStatus] = useState(null); // Estado da base de dados
  const [serverError, setServerError] = useState(null); // Estado do servidor
  const [isLoading, setIsLoading] = useState(true); // Estado de carregamento da página

  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus(); // Colocar foco no campo de email ao carregar a página
    }

    async function checkDBStatus() {
      try {
        const { data, status } = await axiosInstance.get("api/db-status", {
          timeout: 5000,
          validateStatus: () => true,
        });

        if (status === 200 && data.status === "online") {
          setDbStatus("online");
          setServerError(false);
        } else {
          setDbStatus("offline");
          setServerError(false);
        }
      } catch {
        setServerError(true);
        setDbStatus(null);
      } finally {
        setIsLoading(false);
      }
    }

    checkDBStatus();
  }, []);

  // Atualiza os campos do formulário quando o utilizador digita
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Função de login
  const handleLogin = async (e) => {
    e.preventDefault();

    if (serverError) {
      toast.error(messages.server?.server_offline);
      return;
    }

    if (dbStatus === "offline") {
      toast.error(messages.database?.db_offline_message);
      return;
    }

    try {
      const { data } = await axiosInstance.post("api/loginDB", {
        email: formData.email,
        password: formData.password,
      });

      // Store the token in localStorage for use in API requests
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
        console.log('Token stored in localStorage');
      }

      toast.success(messages.auth?.login_success);
      setTimeout(() => router.push("/fileUp"), 1000);
    } catch (error) {
      let errorMessage = messages.auth?.login_error;
      if (error.response) {
        if (error.response.status === 404) errorMessage = messages.auth?.user_not_found;
        else if (error.response.status === 500) errorMessage = messages.server?.server_offline;
      } else if (error.message.includes("Network Error")) {
        errorMessage = messages.server?.server_offline;
      }
      toast.error(errorMessage);
    }
  };

  return (
    <>
      {/* ✅ SEO Tags */}
      <Head>
        <title>Autenticação do FrontEnd</title>
        <meta name="description" content="Login para acesso a serviços." />
      </Head>

      {/* ✅ Header with Logo and DB Status */}
      <div className="container-fluid fixed-top">
        <div className="row p-3">
          <div className="col-4">
            <Logo />
          </div>
          <div className="col-4"></div>
          <div className="col-4 d-flex justify-content-end">
            {!isLoading && (
              <div className="d-flex align-items-center gap-2">
                {serverError === true ? (
                  <>
                    <FiAlertTriangle className="text-danger fs-5 animate-bounce" />
                    <p className="text-secondary mb-0 small">{messages.server?.server_offline}</p>
                  </>
                ) : dbStatus === "online" ? (
                  <>
                    <p className="text-secondary mb-0 small">{messages.database?.db_online}</p>
                    <span className="rounded-circle bg-success" style={{ width: '12px', height: '12px', animation: 'pulse 2s infinite' }} />
                  </>
                ) : (
                  <>
                    <p className="text-secondary mb-0 small">{messages.database?.db_offline}</p>
                    <span className="rounded-circle bg-danger" style={{ width: '12px', height: '12px', animation: 'pulse 2s infinite' }} />
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black text-white relative">
      
        {/* ✅ Animação de Carregamento antes de renderizar o conteúdo */}
        {isLoading && (
          <Loading/>
        )}

        {/* ✅ Formulário de Login */}
        {!isLoading && (
          
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md border border-gray-700 flex flex-col items-center">
            <div className="flex items-center space-x-3 mb-4">
              <Image src="/logo.png" alt="AirDraw Logo" width={40} height={40} />
              <h2 className="text-2xl font-semibold">{messages.auth?.login_title}</h2>
            </div>

            <form onSubmit={handleLogin} className="w-full">
              <Input 
                label={messages.auth?.email_label} 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                ref={emailInputRef} 
                disabled={serverError || dbStatus === "offline"}
              />
              <Input 
                label={messages.auth?.password_label} 
                type="password" 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                disabled={serverError || dbStatus === "offline"}
              />

              <Button text={messages.auth?.login_button} disabled={serverError || dbStatus === "offline"} />

              {/* ✅ Link "Recuperar password" desativado se o servidor estiver offline */}
              <div className={`text-center mt-4 text-sm ${serverError || dbStatus === "offline" ? "opacity-50 pointer-events-none" : ""}`}>
                <a onClick={() => router.push("/recover")} className="text-blue-400 hover:underline cursor-pointer">
                {messages.recover?.title}
                </a>
              </div>
            </form>
            
            {/* ✅ Link "Registe-se" desativado se o servidor estiver offline */}
            <p className={`text-center text-sm mt-4 ${serverError || dbStatus === "offline" ? "opacity-50 pointer-events-none" : ""}`}>
              Ainda não tem conta?{" "}
              <a onClick={() => router.push("/register")} className="text-blue-400 hover:underline cursor-pointer">
                Registe-se
              </a>
            </p>
          </div>
        )}

        {/* ✅ Notificações Toastify */}
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </>
  );
}