import { CalendarsService } from "@/ee/calendars/services/calendars.service";
import { DestinationCalendarRepository } from "@/modules/destination-calendar/destination-calendar.repository";
import { Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class DestinationCalendarService {
  constructor(
    private readonly calendarsService: CalendarsService,
    private readonly destinationCalendarRepository: DestinationCalendarRepository
  ) {}

  async updateDestinationCalendar(integration: string, externalId: string, userId: number) {
    const userCalendars = await this.calendarsService.getCalendars(userId);
    const allCalendars = userCalendars.connectedCalendars.map((cal) => cal.calendars ?? []).flat();
    const credentialId = allCalendars.find(
      (cal) => cal.externalId === externalId && cal.integration === integration && cal.readOnly === false
    )?.credentialId;

    if (!credentialId) {
      throw new NotFoundException(`Could not find calendar ${externalId}`);
    }

    const primaryEmail =
      allCalendars.find((cal) => cal.primary && cal.credentialId === credentialId)?.email ?? null;

    const {
      id,
      integration: updatedCalendarIntegration,
      externalId: updatedCalendarExternalId,
      credentialId: updatedCalendarCredentialId,
    } = await this.destinationCalendarRepository.updateCalendar(
      integration,
      externalId,
      credentialId,
      userId,
      primaryEmail
    );

    return {
      userId: id,
      integration: updatedCalendarIntegration,
      externalId: updatedCalendarExternalId,
      credentialId: updatedCalendarCredentialId,
    };
  }
}