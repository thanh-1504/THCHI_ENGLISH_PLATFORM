import { RankTier } from 'generated/prisma/enums';

export const NextTier: Record<RankTier, RankTier> = {
  [RankTier.BRONZE]: RankTier.SILVER,
  [RankTier.SILVER]: RankTier.GOLD,
  [RankTier.GOLD]: RankTier.PLATINUM,
  [RankTier.PLATINUM]: RankTier.DIAMOND,
  [RankTier.DIAMOND]: RankTier.DIAMOND,
};

export const PrevTier: Record<RankTier, RankTier> = {
  [RankTier.BRONZE]: RankTier.BRONZE,
  [RankTier.SILVER]: RankTier.BRONZE,
  [RankTier.GOLD]: RankTier.SILVER,
  [RankTier.PLATINUM]: RankTier.GOLD,
  [RankTier.DIAMOND]: RankTier.PLATINUM,
};
