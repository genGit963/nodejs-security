const brave = `https://search.brave.com/?mtm_source=brave-browser&mtm_medium=brave-ntp&mtm_campaign=brave-search&mtm_content=37ccebcb-0d40-4965-b0c8-5eddb98bc4d8&mtm_date=20241122`;
const braveUrl = new URL(brave);
console.log(braveUrl.searchParams.get("mtm_campaign"));
braveUrl.searchParams.set("mtm_campaign", "dkjafla");
console.log("searchParams: get", braveUrl.searchParams.get("mtm_campaign"));
console.log("href: ", braveUrl.href);
console.log("search: ", braveUrl.search);
console.log("search ", braveUrl.searchParams);
console.log("host: ", braveUrl.host);
console.log("hostname: ", braveUrl.hostname);
console.log("toJSON: ", braveUrl.toJSON());
console.log("hash: ", braveUrl.hash);