import { bootstrap } from "@/app";
import { AppModule } from "@/app.module";
import { CalendarsService } from "@/ee/calendars/services/calendars.service";
import { HttpExceptionFilter } from "@/filters/http-exception.filter";
import { PrismaExceptionFilter } from "@/filters/prisma-exception.filter";
import { PermissionsGuard } from "@/modules/auth/guards/permissions/permissions.guard";
import { DestinationCalendarOutputResponseDto } from "@/modules/destination-calendar/outputs/destination-calendar.output";
import { TokensModule } from "@/modules/tokens/tokens.module";
import { UsersModule } from "@/modules/users/users.module";
import { INestApplication } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { Test } from "@nestjs/testing";
import { PlatformOAuthClient, Team, User, Credential } from "@prisma/client";
import * as request from "supertest";
import { CredentialsRepositoryFixture } from "test/fixtures/repository/credentials.repository.fixture";
import { OAuthClientRepositoryFixture } from "test/fixtures/repository/oauth-client.repository.fixture";
import { TeamRepositoryFixture } from "test/fixtures/repository/team.repository.fixture";
import { TokensRepositoryFixture } from "test/fixtures/repository/tokens.repository.fixture";
import { UserRepositoryFixture } from "test/fixtures/repository/users.repository.fixture";
import { CalendarsServiceMock } from "test/mocks/calendars-service-mock";

import { APPLE_CALENDAR_TYPE, APPLE_CALENDAR_ID } from "@calcom/platform-constants";
import { SUCCESS_STATUS } from "@calcom/platform-constants";

const CLIENT_REDIRECT_URI = "http://localhost:5555";

describe("Platform Destination Calendar Endpoints", () => {
  let app: INestApplication;

  let oAuthClient: PlatformOAuthClient;
  let organization: Team;
  let userRepositoryFixture: UserRepositoryFixture;
  let oauthClientRepositoryFixture: OAuthClientRepositoryFixture;
  let teamRepositoryFixture: TeamRepositoryFixture;
  let tokensRepositoryFixture: TokensRepositoryFixture;
  let credentialsRepositoryFixture: CredentialsRepositoryFixture;
  let appleCalendarCredentials: Credential;
  let user: User;
  let accessTokenSecret: string;
  let refreshTokenSecret: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [PrismaExceptionFilter, HttpExceptionFilter],
      imports: [AppModule, UsersModule, TokensModule],
    })
      .overrideGuard(PermissionsGuard)
      .useValue({
        canActivate: () => true,
      })

      .compile();

    app = moduleRef.createNestApplication();
    bootstrap(app as NestExpressApplication);

    oauthClientRepositoryFixture = new OAuthClientRepositoryFixture(moduleRef);
    userRepositoryFixture = new UserRepositoryFixture(moduleRef);
    teamRepositoryFixture = new TeamRepositoryFixture(moduleRef);
    tokensRepositoryFixture = new TokensRepositoryFixture(moduleRef);
    credentialsRepositoryFixture = new CredentialsRepositoryFixture(moduleRef);
    organization = await teamRepositoryFixture.create({ name: "organization" });
    oAuthClient = await createOAuthClient(organization.id);
    user = await userRepositoryFixture.createOAuthManagedUser("office365-connect@gmail.com", oAuthClient.id);
    const tokens = await tokensRepositoryFixture.createTokens(user.id, oAuthClient.id);
    accessTokenSecret = tokens.accessToken;
    refreshTokenSecret = tokens.refreshToken;
    appleCalendarCredentials = await credentialsRepositoryFixture.create(
      APPLE_CALENDAR_TYPE,
      {},
      user.id,
      APPLE_CALENDAR_ID
    );
    await app.init();
    jest
      .spyOn(CalendarsService.prototype, "getCalendars")
      .mockImplementation(CalendarsServiceMock.prototype.getCalendars);
  });

  async function createOAuthClient(organizationId: number) {
    const data = {
      logo: "logo-url",
      name: "name",
      redirectUris: [CLIENT_REDIRECT_URI],
      permissions: 32,
    };
    const secret = "secret";

    const client = await oauthClientRepositoryFixture.create(organizationId, data, secret);
    return client;
  }

  it("should be defined", () => {
    expect(oauthClientRepositoryFixture).toBeDefined();
    expect(userRepositoryFixture).toBeDefined();
    expect(oAuthClient).toBeDefined();
    expect(accessTokenSecret).toBeDefined();
    expect(refreshTokenSecret).toBeDefined();
    expect(user).toBeDefined();
  });

  it(`POST /v2/destination-calendar: it should respond with a 201 returning back the user updated destination calendar`, async () => {
    const body = {
      integration: appleCalendarCredentials.type,
      externalId: "https://caldav.icloud.com/20961146906/calendars/83C4F9A1-F1D0-41C7-8FC3-0B$9AE22E813/",
    };

    await request(app.getHttpServer())
      .post("/v2/destination-calendar")
      .set("Authorization", `Bearer ${accessTokenSecret}`)
      .send(body)
      .expect(201)
      .then(async (response) => {
        const responseBody: DestinationCalendarOutputResponseDto = response.body;

        expect(responseBody.status).toEqual(SUCCESS_STATUS);
        expect(responseBody.data).toBeDefined();
        expect(responseBody.data.credentialId).toEqual(appleCalendarCredentials.id);
        expect(responseBody.data.integration).toEqual(body.integration);
        expect(responseBody.data.externalId).toEqual(body.externalId);
        expect(responseBody.data.userId).toEqual(user.id);
      });
  });

  afterAll(async () => {
    await oauthClientRepositoryFixture.delete(oAuthClient.id);
    await teamRepositoryFixture.delete(organization.id);
    await userRepositoryFixture.deleteByEmail(user.email);
    await app.close();
  });
});