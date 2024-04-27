const Listing = require("../models/listing");
// const mbxGeoCoding = require("@mapbox/mapbox-sdk/services/tilesets");
// const mapToken = process.env.MAP_TOKEN;
// const geoCodingClient = mbxGeoCoding({ accessToken: mapToken });

module.exports.index = async (req, res, next) => {
  try {
    const allListings = await Listing.find({});
    res.render("listing/index.ejs", { allListings });
  } catch (err) {
    next(err);
  }
};

module.exports.renderNewForm = (req, res) => {
  res.render("listing/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist");
    return res.redirect("/listings");
  }
  console.log(listing);
  res.render("listing/show.ejs", { listing });
};

module.exports.createListings = async (req, res, next) => {
  // // geoCoding
  
  // let response = await geocodingClient
  //   .forwardGeocode({
  //     query: "Karachi, Pakistan",
  //     limit: 1,
  //   })
  //   .send();
  //   console.log(response);
  //   res.send("done")

  let filename = req.file.filename;
  let url = req.file.path;
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  await newListing.save();
  req.flash("success", "New listing created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  // if (!listing) {
  //   req.flash("error", "Listing you requested for does not exist");
  //   return res.redirect("/listings");
  // }
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");
  res.render("listing/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  if (typeof req.file !== "undefined") {
    let filename = req.file.filename;
    let url = req.file.path;
    listing.image = { url, filename };
    await listing.save();
  }

  req.flash("success", "listing updated");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "listing deleted");
  res.redirect("/listings");
};
