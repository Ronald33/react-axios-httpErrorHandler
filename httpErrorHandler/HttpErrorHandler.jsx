let _triggerFn = null

const HttpErrorHandler = () => null

HttpErrorHandler.registerApi = (axiosInstance) =>
{
    axiosInstance.interceptors.response.use(
        (response) => response,
        (error) =>
        {
            const disabled = error.config?._disableErrorHandler

            if(!disabled && _triggerFn) { _triggerFn(error) }

            return Promise.reject(error)
        }
    )
}

HttpErrorHandler.setTrigger = (fn) =>
{
    _triggerFn = fn
}

export default HttpErrorHandler