import * as DB from "./database.js";

export async function sectionUpdate(sectionString, checked) {
   const precFeeID = `precipitationFee`;
   const precAreaID = `precipitationArea`;
   const oilID = 'oilPerCm';
   const tanksID = 'numberOfOilTanks';

   const root = document.documentElement;
   const textColor = getComputedStyle(root).getPropertyValue('--primaryTextColor').trim();
   const disabledTextColor = getComputedStyle(root).getPropertyValue('--disabledTextColor').trim();

   let input1 = (sectionString == 'water') ? precFeeID : oilID;
   let input2 = (sectionString == 'water') ? precAreaID : tanksID;
   let color1 = (checked) ? textColor : disabledTextColor;
   let color2 = (checked) ? disabledTextColor : textColor;

   $(`#${input1}, #${input2}`).prop(`disabled`, !checked);
   $(`#${input1}, #${input2}`).css(`color`, color1);
   $(`label[for="${input1}"], label[for="${input2}"]`).css(`color`, color1);
   const apartmentcount = await DB.getValueFromDB(`apartmentcount`);
   for (let i = 1; i <= apartmentcount; i++) {
      $(`#apartment${i}${input1}, #apartment${i}${input2}`).prop(`disabled`, checked);
      $(`#apartment${i}${input1}, #apartment${i}${input2}`).css(`color`, color2);
      $(`label[for="apartment${i}${input1}"], label[for="apartment${i}${input2}"]`).css(`color`, color2);
   }
}

export function getDate() {
   const date = new Date();
   return date;
}