import { expect } from "chai";
import bcrypt from "bcrypt";
import sinon from "sinon";

import AuthenticationController from "../../../src/controllers/Authentication.controller.js";
import HTTPError from "../../../src/utils/HTTPError.js";
import userData from "../../data/user.test.data.js";

describe("User controller tests: ", () => {
  const testUserEmail = userData.submissions[0].emailAddress;
  const testUserPassword = userData.submissions[0].password;
  const testHashedPassword = "hashedPassword";
  let authenticationController;
  let userService;
  let hashStub;
  let req;
  let res;
  let next;

  beforeEach(() => {
    hashStub = sinon.stub(bcrypt, "hash");
    hashStub.resolves(testHashedPassword);
    userService = {
      createUser: sinon.stub(),
      findByEmailAddress: sinon.stub(),
    };

    authenticationController = new AuthenticationController(userService);
    req = {
      body: userData.submissions[0],
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };
    next = sinon.stub();
  });

  afterEach(() => {
    authenticationController = null;
    userService = null;
    hashStub.restore();
    req = null;
    res = null;
    next = null;
  });

  describe("register user tests", () => {
    //? AC4-1
    it("should call hash on bcrypt with the password", async () => {
      //Arrange
      const expectedPasswordToHash = testUserPassword;
      const expectedSalts = 10;
      //Act
      await authenticationController.register(req, res);
      const [actualPasswordToHash, actualSalts] = hashStub.getCall(0).args;
      //Assert
      expect(actualPasswordToHash).to.equal(expectedPasswordToHash);
      expect(actualSalts).to.equal(expectedSalts);
    });

    //? AC4-2
    it("should pass the user email and hashed password to create user on the User service", async () => {
      //Act
      await authenticationController.register(req, res);
      const [actualEmailAddressArg, actualHashedPasswordArg] =
        userService.createUser.getCall(0).args;
      //Assert
      expect(actualEmailAddressArg).to.equal(testUserEmail);
      expect(actualHashedPasswordArg).to.equal(testHashedPassword);
    });

    //? AC4-3
    it("should respond with a status of 400 if the User service throws a HTTP error with a status of 400", async () => {
      //Arrange
      const testError = new HTTPError(
        400,
        "A user with this email already exists"
      );
      userService.createUser.rejects(testError);
      //Act
      await authenticationController.register(req, res);
      //Assert
      expect(res.status.calledWith(400)).to.be.true;
    });

    //? AC4-4
    it("should respond with a status code of 500 if the User service throws an error without a status code of 400", async () => {
      //Arrange
      userService.createUser.rejects(new Error());
      //Act
      await authenticationController.register(req, res);
      //Assert
      expect(res.status.calledWith(500)).to.be.true;
    });

    //? AC4-5
    it("should respond with a 201 status if the user was created successfully", async () => {
      //Arrange
      const testId = userData.documents[0]._id;
      userService.createUser.resolves(testId);
      //Act
      await authenticationController.register(req, res);
      //Assert
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledWith(undefined)).to.be.true;
    });
  });

  describe("signIn tests", () => {
    //? AC5-1
    it("should call findByEmailAddress on the User Service", async () => {
      //Act
      await authenticationController.signIn(req, res, next);
      //Assert
      expect(userService.findByEmailAddress.calledWith(testUserEmail)).to.be
        .true;
    });
  });
});
