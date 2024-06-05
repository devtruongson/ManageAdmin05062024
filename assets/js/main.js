const _CATE = "categories";
const _PRODUCTS = "products";

let listCate = JSON.parse(localStorage.getItem(_CATE))
let listProduct = JSON.parse(localStorage.getItem(_PRODUCTS))
const renderProductElement = document.querySelector("#render-content-system")
const modalTitle = document.querySelector(".modal-title")
const btnHandler = document.querySelector("#btn-handler")

let page = 0;
let pageSize = 8;
let totalPage = 0;
let offset = 0;
let idEdit = -1;

if (!listCate) {
    listCate = ["Thời trang trẻ em", "Thời trang người lớn", "Quý phái"];
    localStorage.setItem(_CATE, JSON.stringify(listCate));
}
renderProduct();

if (!listProduct) {
    listProduct = [];
    localStorage.setItem(_PRODUCTS, JSON.stringify([]));
}
const formSubmit = document.querySelector("#form-submit-system");

if (formSubmit) {
    formSubmit.addEventListener("submit", e => {
        e.preventDefault();
        const inputCacheId = document.querySelector("#input-cache-id");
        if (inputCacheId && inputCacheId.value) {
            const dataBuilder = {};
            const elements = formSubmit.querySelectorAll("[name]");
            elements.forEach(ele => {
                dataBuilder[ele.name] = ele.value;
            })
            let listProduct = JSON.parse(localStorage.getItem(_PRODUCTS));
            listProduct = listProduct.map(product => {
                if (product.id === inputCacheId.value) {
                    return dataBuilder;
                } else {
                    return product;
                }
            })
            localStorage.setItem(_PRODUCTS, JSON.stringify(listProduct));
            renderProduct();
            Swal.fire({
                title: "Thành công?",
                text: "Bạn đã cập nhật sản phẩm thành công?",
                icon: "success"
            })
            handleResetFormModal()
        } else {
            const id = uuidv4();
            const dataBuilder = {};
            const elements = formSubmit.querySelectorAll("[name]");
            elements.forEach(ele => {
                dataBuilder[ele.name] = ele.value;
            })

            dataBuilder.id = id;
            let listProduct = JSON.parse(localStorage.getItem(_PRODUCTS));
            listProduct.push(dataBuilder);
            localStorage.setItem(_PRODUCTS, JSON.stringify(listProduct));
            renderProduct();
            Swal.fire({
                title: "Thành công?",
                text: "Bạn đã tạo sản phẩm thành công?",
                icon: "success"
            })
            handleResetFormModal()
        }
    })

}

function renderProduct() {
    if (!renderProductElement) {
        return;
    }
    let listProduct = JSON.parse(localStorage.getItem(_PRODUCTS));
    if (listProduct && listProduct.length > 0) {
        totalPage = Math.ceil(listProduct.length / pageSize)
        if (!offset) {
            offset = pageSize;
        } else {
            offset = page * pageSize + pageSize
        }
        const htmlRender = listProduct.map((product, index) => {
            if (index >= page * pageSize && index < offset) {
                return `
                <div class="col-3 mb-5">
                    <div class="card shadow-sm overflow-hidden" style="width: 100%">
                        <div style="height: 359px; overflow: hidden">
                            <img
                                src="${product.image}"
                                class="card-img-top img-card-item"
                                alt="..."
                            />
                        </div>
                        <div class="card-body">
                            <h5 class="card-title title-product">
                               ${product.title}
                            </h5>
                            <p class="card-text">${product.categories}</p>
                            <p class="card-text">Trạng thái: ${product.status === "show" ? "Đang kinh doanh" : "Ngừng kinh doanh"}</p>
                            <div class="d-flex justify-content-end gap-3 align-items-center">
                               ${product.discount > 0 ? `<span class="price-origin discount"> ${validateVND(product.price)}</span>` : ""}
                                <span class="price-discount">   ${product.discount > 0 ? `${validateVND(product.price - product.price * (product.discount / 100))}` : validateVND(product.price)} </span>
                            </div>
                            <div
                                style="border-top: 1px solid #ddd"
                                class="mt-2 d-flex justify-content-center gap-3 align-items-center pt-3"
                            >
                                ${product.status === "show" ? `
                                    <button
                                        class="btn btn-primary"
                                        data-bs-toggle="modal"
                                        data-bs-target="#modal-app"
                                        onclick="handleUpdate('${product.id}')"
                                    >
                                        Sửa
                                    </button>
                                    <button data-action="xóa" onclick="handleDelete('${product.id}')" class="btn btn-warning">Xóa</button>`
                        : `
                                    <button  onclick="handleRestore('${product.id}')" class="btn btn-warning">Khôi phục</button>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            `
            }
        }).join("").concat(`
        <div class="d-flex align-items-center justify-content-center pb-4 pt-4">
            <button
                data-action="create"
                class="btn btn-primary"
                data-bs-toggle="modal"
                data-bs-target="#modal-app"
                onclick="handleResetFormModal()"
            >
                Tạo mới sản phẩm
            </button>
        </div>
        <div class="d-flex align-items-center justify-content-center pb-4 pt-2">
            <ul class="pagination pagination-sm">
                ${handlePagination()}
            </ul>
        </div>
        `)
        renderProductElement.innerHTML = htmlRender;
    } else {
        renderProductElement.innerHTML = `
        <div>
            <div class="pt-5 pb-2">
                <img
                    style="width: 200px; height: 200px; object-fit: cover"
                    class="d-block mx-auto"
                    src="https://cdn-icons-png.flaticon.com/512/6598/6598519.png"
                    alt=""
                />
                <div>
                    <p style="font-weight: 600" class="text-center pb-0 mb-1">
                        Bạn chưa có sản phẩm nào
                    </p>
                    <p style="font-weight: 600" class="text-center">
                        Hãy ấn vào nút thêm để tạo sản phẩm
                    </p>
                </div>
                <div class="d-flex align-items-center justify-content-center">
                    <button
                        data-action="create"
                        class="btn btn-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#modal-app"
                        onclick="handleResetFormModal()"
                    >
                        Tạo mới sản phẩm
                    </button>
                </div>
            </div>
        </div>
        `
    }
}

function handleResetFormModal() {
    modalTitle.innerText = "Thêm sản phẩm";
    btnHandler.innerText = "Tạo sản phẩm";
    formSubmit && formSubmit.reset();
}

function handleRestore(id) {
    if (!id) {
        Swal.fire({
            title: "Nguy hiểm?",
            text: "Có lỗi xảy ra không thể lấy ID?",
            icon: "warning"
        })
        return;
    }
    Swal.fire({
        title: "Nguy hiểm?",
        text: "Bạn chắc chắn muốn khôi phục sản phẩm này chứ?",
        icon: "question",
        showCancelButton: true,
        showConfirmButton: true
    }).then(res => {
        if (res.isConfirmed) {
            if (!id) {
                Swal.fire({
                    title: "Nguy hiểm?",
                    text: "Có lỗi xảy ra không thể lấy ID?",
                    icon: "warning"
                })
            } else {
                let listProduct = JSON.parse(localStorage.getItem(_PRODUCTS));
                listProduct = listProduct.map(product => {
                    if (product.id === id) {
                        return {
                            ...product,
                            status: "show"
                        };
                    } else {
                        return product;
                    }
                })
                localStorage.setItem(_PRODUCTS, JSON.stringify(listProduct));
                renderProduct();
            }
        }
    })
}

function handlePagination() {
    let html = "";
    for (let i = 0; i < totalPage; i++) {
        html += `<li class="page-item"><a onclick="handleChangePage(${i})" class="${page === i ? "active" : ""} page-link" href="#">${i + 1}</a></li>`;
    }
    return html;
}

function handleDelete(id) {
    Swal.fire({
        title: "Nguy hiểm?",
        text: "Bạn chắc chắn muốn xóa sản phẩm này chứ?",
        icon: "question",
        showCancelButton: true,
        showConfirmButton: true
    }).then(res => {
        if (res.isConfirmed) {
            if (!id) {
                Swal.fire({
                    title: "Nguy hiểm?",
                    text: "Có lỗi xảy ra không thể lấy ID?",
                    icon: "warning"
                })
            } else {
                let listProduct = JSON.parse(localStorage.getItem(_PRODUCTS));
                const newListProduct = listProduct.filter(product => product.id !== id);
                localStorage.setItem(_PRODUCTS, JSON.stringify(newListProduct));
                renderProduct();
            }
        }

    })
}

function handleUpdate(id) {
    if (!id) {
        Swal.fire({
            title: "Nguy hiểm?",
            text: "Có lỗi xảy ra không thể lấy ID?",
            icon: "warning"
        })
        return;
    }
    modalTitle.innerText = "Chỉnh sửa sản phẩm";
    if (btnHandler) {
        btnHandler.innerText = "Chỉnh sửa";
    }
    let listProduct = JSON.parse(localStorage.getItem(_PRODUCTS));
    const product = listProduct.find(item => item.id === id);
    const elements = formSubmit.querySelectorAll("[name]");
    elements.forEach(ele => {
        for (item in product) {
            if (ele.name === item) {
                ele.value = product[item];
            }
        }
    })
}

function handleChangePage(index) {
    page = index;
    renderProduct();
}

function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
    );
}

function validateVND(vnd) {
    vnd = +vnd;
    return vnd.toLocaleString("it-IT", { style: "currency", currency: "VND" });
}

document.getElementById('sortForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const sort = document.getElementById('sort').value;
    const order = document.getElementById('order').value;
    const num = document.getElementById('num').value;
    const status = document.getElementById('status').value;

    const queryString = `?sort=${sort}&order=${order}&status=${status}&num=${num}`;
    console.log(queryString);
    history.pushState(null, '', queryString);
});
