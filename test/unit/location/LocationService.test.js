import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

import LocationService from "../../../src/services/LocationService.js";
import Location from "../../../src/models/Location.model.js";

use(chaiAsPromised);

describe("Location service tests: ", () => {
  //SET-UP LOCATION SERVICE TESTS
  let locationService = null;
  let findOneLocationStub = null;
  let createLocationStub = null;

  beforeEach(() => {
    locationService = new LocationService();
    findOneLocationStub = sinon.stub(Location, "findOne");
    createLocationStub = sinon.stub(Location, "create");
  });

  //CLEAN-UP LOCATION SERVICE TESTS
  afterEach(() => {
    locationService = null;
    findOneLocationStub.restore();
    createLocationStub.restore();
  });

  describe("addLocation tests: ", () => {
    //TEST DATA
    const testLocationBody = {
      label: "Peterborough",
      latitude: 52.56824186035162,
      longitude: -0.24517818700143068,
    };
    const testFormattedLocationObject = {
      label: testLocationBody.label,
      latAndLong: {
        type: "Point",
        coordinates: [testLocationBody.longitude, testLocationBody.latitude],
      },
      coordinateIdentifier: `${testLocationBody.latitude},${testLocationBody.longitude}`,
    };

    //? LS1-1
    it("should call findOne on the Location model with the correct coordinateIdentifier", async () => {
      //Arrange
      const expected = {
        coordinateIdentifier: testFormattedLocationObject.coordinateIdentifier,
      };
      //Act
      await locationService.addLocation(testLocationBody);
      const result = findOneLocationStub.getCall(0).args[0];
      //Assert
      expect(result).to.deep.equal(expected);
    });

    //? LS1-2
    it("should return the correct location where a location with the same coordinates as those supplied is already in the collection", async () => {
      //Arrange
      const expected = testFormattedLocationObject;
      findOneLocationStub.resolves(expected);
      //Act
      const result = await locationService.addLocation(testLocationBody);
      //Assert
      expect(result).to.equal(expected);
    });

    //? LS1-3
    it("should throw an error if findOne fails", async () => {
      findOneLocationStub.rejects();
      await expect(
        locationService.addLocation(testLocationBody)
      ).to.be.rejectedWith(Error);
    });

    //? LS1-4
    it("should call create with the correctly formatted location details on the Location model if findOne returns null", async () => {
      //Arrange
      findOneLocationStub.resolves(null);
      createLocationStub.resolves(testFormattedLocationObject);
      //Act
      await locationService.addLocation(testLocationBody);
      const result = createLocationStub.getCall(0).args[0];
      //Assert
      expect(result).to.deep.equal(testFormattedLocationObject);
    });

    //? LS1-5
    it("should return a new location document with the correct properties where a location with the supplied coordinates was not already in the collection", async () => {
      //Arrange
      findOneLocationStub.resolves(null);
      createLocationStub.resolvesArg(0);
      //Act
      const result = await locationService.addLocation(testLocationBody);

      //Assert
      expect(result).to.deep.equal(testFormattedLocationObject);
    });

    //? LS1-6
    it("It should throw an error if create throws an error", async () => {
      //Arrange
      findOneLocationStub.resolves(null);
      createLocationStub.rejects();
      await expect(
        locationService.addLocation(testLocationBody)
      ).to.be.rejectedWith(Error);
    });
  });
});
