async function test() {
  try {
    const res = await fetch('http://localhost:5000/api/retailer/negotiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        crop: 'wheat',
        farmerPrice: 2500,
        message: 'hello',
        retailerId: 6,
        marketId: 'belagavi'
      })
    });
    
    if (res.ok) {
      console.log("SUCCESS:", await res.json());
    } else {
      console.log("ERROR STATUS:", res.status);
      console.log(await res.text());
    }
  } catch (e) {
    console.log("FETCH ERROR:", e);
  }
}

test();
