export interface AtomsGlobalConfigProps {
  /**
   * API endpoint for the Booker component to fetch data from,
   * defaults to https://cal.com
   */
  webAppUrl?: string;
}

export interface ConnectButtonProps {
  buttonText?: string;
  onButtonClick: () => Promise<void>;
}
