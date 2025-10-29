import * as DB from "./database.js";
export async function waterSectionUpdate(checked){
    console.log("water check section update",checked);
    if(checked){
                // precipitationFee und precipitationArea enablen, farbe auf schwarz setzen, alle apartment precipitationFee und precipitationArea inputs disablen und farbe auf grau setzen
                $('#precipitationFee, #precipitationArea').prop('disabled', false);
                $('#precipitationFee, #precipitationArea').css('color', 'black');
                $('label[for="precipitationFee"], label[for="precipitationArea"]').css('color', 'black');
                 const apartmentcount = await DB.getValueFromDB('apartmentcount');
                 for(let i=1;i<=apartmentcount;i++){
                    $(`#apartment${i}precipitationFee, #apartment${i}precipitationArea`).prop('disabled', true);
                    $(`#apartment${i}precipitationFee, #apartment${i}precipitationArea`).css('color', '#8c8c8c');
                    $(`label[for="apartment${i}precipitationFee"], label[for="apartment${i}precipitationArea"]`).css('color', '#8c8c8c');
                 }
            }
            else{
                // obige Logik umkehren
                $('#precipitationFee, #precipitationArea').prop('disabled', true);
                $('#precipitationFee, #precipitationArea').css('color', '#8c8c8c');
                $('label[for="precipitationFee"], label[for="precipitationArea"]').css('color', '#8c8c8c');
                 const apartmentcount = await DB.getValueFromDB('apartmentcount');
                 for(let i=1;i<=apartmentcount;i++){
                    $(`#apartment${i}precipitationFee, #apartment${i}precipitationArea`).prop('disabled', false);
                    $(`#apartment${i}precipitationFee, #apartment${i}precipitationArea`).css('color', 'black');
                    $(`label[for="apartment${i}precipitationFee"], label[for="apartment${i}precipitationArea"]`).css('color', 'black');
                 }
            }
}