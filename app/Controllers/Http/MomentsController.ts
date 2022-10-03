import { v4 as uuidv4 } from 'uuid'

import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext' //tudo que é enviado na request, ele vai conter

import Application from '@ioc:Adonis/Core/Application' //usado para mover os arquivos(no caso as imagens) para onde queremos

import Moment from 'App/Models/Moment'

export default class MomentsController {
    private validationOptions = {
        types: ["image"],
        size: "2mb"
    }

    public async store({ request, response }: HttpContextContract) {  //POST
        const body = request.body()

        const image = request.file('image', this.validationOptions) //valida a imagem antes e armazenar

        if (image) {
            const imageName = `${uuidv4()}.${image.extname}`

            await image.move(Application.tmpPath('uploads'), {
                name: imageName
            })

            body.image = imageName
        }

        const moment = await Moment.create(body)

        response.status(201)

        return {
            message: "Momento criado com sucesso",
            data: moment,
        }
    }

    public async index() {  //GET

        const moments = await Moment.all()

        return {
            data: moments
        }
    }

    public async show({ params }: HttpContextContract) {

        const moment = await Moment.findOrFail(params.id)

        return {
            data: moment,
        }
    }

    public async destroy({ params }: HttpContextContract) {
        const moment = await Moment.findOrFail(params.id)

        await moment.delete()

        return {
            message: "Momento excluído com sucesso",
            data: moment,
        }
    }


}
