export default function handler(req, res) {
    // get the tokenId from the query params
    const tokenId = req.query.tokenId;
    // extract images from github directly
    const image_url = "https://raw.githubusercontent.com/LearnWeb3DAO/NFT-Collection/main/my-app/public/cryptodevs/";
    // To make our collection compatible with Opensea, we need to follow some Metadata standards
    // when sending back the response from the api

    res.status(200).json({
        name: "K4713 Dev #" + tokenId,
        description: "K4713 Dev is a collection of developers in crypto",
        image: image_url + tokenId + ".svg",
    });
}