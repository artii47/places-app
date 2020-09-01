const HttpError = require('../models/http-error');
const Place = require('../models/place');
const getCoordsForAdress = require('../utils/location');
const User = require('../models/user');
const mongoose = require('mongoose');

const getPlaceById = async (req, res, next) => {
  const _id = req.params.pid;
  let place;
  try {
    place = await Place.findById(_id);
    res.send({ place });
  } catch (err) {
    return next(new HttpError('Could not find a place', 404));
  }
  if (!place) {
    return next(new HttpError('Could not find a place by provided id', 404));
  }
};

const getPlacesByUserId = async (req, res, next) => {
  let places;
  try {
    places = await Place.find({ creator: req.params.uid });
    res.send({ places });
  } catch (err) {
    return next(
      new HttpError('Fetching places failed, please try again later', 500)
    );
  }
  if (!places || places.length === 0) {
    return next(new HttpError('Could not find places for provided user id'));
  }
};

const createPlace = async (req, res, next) => {
  const { title, description, address, creator } = req.body;
  const coordinates = await getCoordsForAdress(address);
  const place = new Place({
    title,
    description,
    location: coordinates,
    address,
    creator,
    image: req.file.path,
  });

  let user;

  try {
    user = await User.findById(creator);
  } catch (err) {
    return next(new HttpError('Something went wrong. Try again later.'));
  }

  if (!user) {
    return next(new HttpError('User not found'));
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await place.save({ session });
    user.places.push(place);
    await user.save({ session });
    await session.commitTransaction();
    res.send(place);
  } catch (err) {
    console.log('err', err);
    return next(new HttpError('Creating place failed, please try again.', 500));
  }
};

const updatePlace = async (req, res, next) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['title', 'description'];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return next(new HttpError('Invalid operation', 400));
  }

  try {
    const _id = req.params.pid;
    const place = await Place.findById(_id);

    if (!place) {
      return next(new HttpError('Could not find place', 404));
    }

    updates.forEach((update) => (place[update] = req.body[update]));
    await place.save();
    res.send(place);
  } catch (err) {
    return next(new HttpError('Could not update place', 400));
  }
};

const deletePlace = async (req, res, next) => {
  let place;
  try {
    place = await Place.findById(req.params.pid).populate('creator');
  } catch (err) {
    return next(new HttpError('Could not find place', 400));
  }
  if (!place) {
    return next(new HttpError('Could not find place', 404));
  }
  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await place.remove({ session });
    place.creator.places.pull(place);
    await place.creator.save({ session });
    await session.commitTransaction();
    res.status(200).send({ message: 'Deleted' });
  } catch (err) {
    return next(new HttpError('Could not delete place', 400));
  }
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
