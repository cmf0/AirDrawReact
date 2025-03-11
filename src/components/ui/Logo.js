export default function Logo() {
    return (
        <div className="flex flex-row justify-start items-center mb-8 pl-5 md:pl-8">
            <img 
                src="/logo.png" 
                alt="AirGallery" 
                className="w-12 h-12 md:w-20 md:h-20 mr-4 md:mr-5"
            />
            <h1 className="text-xl md:text-4xl font-semibold m-0">
                AirGallery
            </h1>
        </div>
    )
}
