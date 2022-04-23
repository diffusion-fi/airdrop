const data = require("../data.json")

const getTotal = () => {
	let amount = 0
	data.map(x => {
		amount += Number(x.amount)
	})
	console.log(amount.toLocaleString('fullwide', {useGrouping:false}))
	return amount
}

getTotal()
