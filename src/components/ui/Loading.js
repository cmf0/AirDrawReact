import Image from "next/image";

export default function Button({ text, onClick, disabled }) {
    return (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50">
            <Image
                src="/logo.png"
                alt="Loading Logo"
                width={72}
                height={72}
                className="animate-spin mb-4"
            />
            <p className="text-lg font-semibold text-white">A carregar...</p>
        </div>
    );
  }