import premiumService from "../../services/premium.service";

export const premiumLoader = {
  getAllPlans: () => {
    return premiumService.getAllPlans();
  },
};
