/**
 * Created with JetBrains WebStorm.
 * User: oola
 * Date: 9/5/13
 * Time: 11:54 AM
 * To change this template use File | Settings | File Templates.
 */

function addCommas(nStr)
{
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}
