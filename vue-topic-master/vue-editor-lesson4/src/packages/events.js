import mitt from 'mitt'; // 导入mitt库
export const events = mitt(); // 导出一个发布订阅的对象 

/**  
 * mitt是一个轻量级的发布订阅库，它可以让你轻松地创建和使用自定义事件。
 * 使用mitt来创建了一个发布订阅的对象，然后将其导出为events，以便其他组件或模块可以使用它。
 */
