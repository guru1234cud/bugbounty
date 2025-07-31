  async function checkCount() {
      const product = document.getElementById("location-select").value;

      try {
        const response = await fetch("http://localhost:3000/product_count", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ product })
          
        });

        const data = await response.json();
        console.log(data);
        
        document.getElementById("stock-result").textContent = `Available units: ${data.count}`;
      } catch (err) {
        document.getElementById("stock-result").textContent = "Error connecting to server.";
        document.getElementById("stock-result").style.color = "red";
      }
    }