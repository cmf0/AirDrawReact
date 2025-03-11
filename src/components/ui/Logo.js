
export default function Logo() {
    return (
        <div style={{ 
            display: "flex", 
            flexDirection: "row", 
            justifyContent: "flex-start", 
            alignItems: "center", 
            marginBottom: "30px",
            paddingLeft: "20px"
          }}>
            <img src="/logo.png" alt="AirGallery" style={{ 
              width: "80px", 
              height: "80px",
              marginRight: "20px"
            }} />
            <h1 style={{ 
              fontSize: "2.5rem",
              margin: 0,
              fontWeight: "600"
            }}>AirGallery</h1>
          </div>
    )
}
