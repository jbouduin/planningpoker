/**
 * The estimation Dto
 */
export interface EstimationDto {
  /**
   * The card index from the card.
   * If undefined it means that the participant has not given an estimation (yet) or withdrawn his estimation
   * !This is not the index of the card in the array of cards. It is the field `index` of `ICard
   */
  cardIndex: number | null;
  // revealed: boolean,
  /**
   * The participantId of the participant giving the estimation
   */
  participantId: string;
}
