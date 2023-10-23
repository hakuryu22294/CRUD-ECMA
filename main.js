
import './style.css'
import Navigo from 'navigo';

const api = "http://localhost:3000/products";
const prdList = document.getElementById('prd-list');
const form = document.getElementById('form');

let editId = null;
let editting = false;
// let editing = false;
const router = new Navigo("/");

const fetchDatat = async api =>{
    try{
        const res = await fetch(api);
        return res.json();
    }catch(err){
        console.log(err);
    }
}

const renderPrds = async () =>{
    const prds = await fetchDatat(api);
    prdList.innerHTML = "";

    prds.forEach(prd => {
        const prdItems = document.createElement('div');
        prdItems.classList.add("prd-items", "col-4", "bg-body-secondary", "p-3");
        prdItems.setAttribute('data-id', prd.id);
        prdItems.innerHTML=`
            <h3>Name: <a href="/${prd.id}" class="text-success">${prd.name}</a></h3>
            <h4>Price: <span class="text-danger">${prd.price}</span></h4>
            <h4 class="desc">Description: <span class="text-primary">${prd.desc}</span></h4>
            <button class="btn btn-success edit" data-id="${prd.id}">Edit</button>
            <button class="btn btn-danger delete" data-id="${prd.id}">Delete</button>
        `;
        
        prdList.appendChild(prdItems);
    })
    document.querySelectorAll('.edit').forEach((btnEdit) => {
        btnEdit.addEventListener('click', ()=>{
            document.querySelectorAll('.edit').forEach(btnEdit => btnEdit.classList.remove('editting'))
                const prdId = btnEdit.getAttribute('data-id');
                editPrd(prdId);
            //     document.getElementsByClassName('prd-items')[index].innerHTML = `
            //    `;
        })
    });
    document.querySelectorAll('.delete').forEach((btnDelete) => {
        btnDelete.addEventListener('click', ()=>{
            const prdId = btnDelete.getAttribute('data-id');
            deletePrd(prdId);
        })
    });
    router.on("/:id", async ({data}) => prdList.innerHTML = await renderDetails(data.id))
    .on("/", () => renderPrds()).resolve();
}

renderPrds();



const renderDetails = async id => {
    const prd = await fetchDatat(`${api}/${id}`);
    document.getElementById('title').innerHTML = `Product Details: ${prd.name}`;

    return `
    <div class="prd-items mx-auto bg-body-secondary py-3 w-100">
        <h3>Name: <a href="/${prd.id}" class="text-success">${prd.name}</a></h3>
        <h4>Price: <span class="text-danger">${prd.price}</span></h4>
        <h4>Description: <span class="text-primary">${prd.desc}</span></h4>
        <a href="/"><< Back to Product List</a>
    </div>
    `
}

const innerErr = (err,element) => {
    const errors = document.getElementById('errors');
    errors.innerHTML = err;
    element.classList.add('border', 'border-danger');
    setTimeout(()=>{
        errors.style.opacity = 0
        element.classList.remove('border-danger');
    }, 1500);
    errors.style.opacity = 1;
}

const validation = (name, price, desc) =>{
    const parsePrice = parseFloat(price);
    if(name.length === 0){
        innerErr('Name is not empty !', document.getElementById('name'));
        return false;
    }
    if(isNaN(parsePrice) || parsePrice < 0){
        innerErr('Price is not < 0 !', document.getElementById('price'));
        return false;
    }
    if(desc.length < 10){
        innerErr('Description is > 10 char !', document.getElementById('desc'));
        return false;
    }
    return true;
}

const performAction = async (apiEnd, method, data) =>{
    try{
        const res = await fetch(apiEnd, {
            method: method,
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        })
        await res.json();
        renderPrds();
        form.reset();
        editId = null;
        editting = false;
    }catch(err){
        console.log(err);
    }
}

const addPrd = async e =>{
    e.preventDefault();
    const name = document.getElementById('name').value;
    const price = document.getElementById('price').value;
    const desc = document.getElementById('desc').value;

    if(!validation(name, price, desc)) return;
    const newPrd = {name, price, desc};

    const apiEnd = editId ? `${api}/${editId}` : api;
    const method = editId ? "PUT" : 'POST';
    const str = editId ? "Edit" : "Add";

    await performAction(apiEnd, method, newPrd);
    alert(`${str} is successfully !`);
}

const editPrd = async id => {
   
    if(editting){
        alert('Bạn đang thực hiện chỉnh sửa một sản phẩm, vui lòng hoàn thành !');
        return;
    }

    
    editId = id;
    editting = true;
    const prd = await fetchDatat(`${api}/${editId}`);
    const {name, price, desc} = prd;

    document.querySelectorAll('.prd-items').forEach(item => {
        if(item.getAttribute('data-id') === id){
            item.innerHTML =`
            <p class="btn btn-success" disabled>
            <span class="spinner-border spinner-border-sm"></span>
            ${prd.name} is Updating...
            </p>
            `    
        }
    })

    

    document.getElementById('name').value = prd.name;
    document.getElementById('price').value = prd.price;
    document.getElementById('desc').value = prd.desc;
}

const deletePrd = async id =>{
    const okDelete = confirm('Are you want delete !');
    try{
        if(okDelete){
            await fetch(`${api}/${id}`, {method: 'DELETE'});
            renderPrds();
            alert('Product deleted successfully !');
        }
    }catch(err){
        console.log(err);
    }
}

form.addEventListener('submit', addPrd)


