import { v4 as uuidv4 } from 'uuid'

import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext' //tudo que é enviado na request, ele vai conter

import Application from '@ioc:Adonis/Core/Application' //usado para mover os arquivos(no caso as imagens) para onde queremos

import Moment from 'App/Models/Moment'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'

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

        const moments = await Moment.query().preload("comments") //preload carrega todos os comentários do relacionamento

        return {
            data: moments
        }
    }

    public async show({ params }: HttpContextContract) {

        const moment = await Moment.findOrFail(params.id)

        await moment.load("comments") //carrega todos os comentários do post individualmente

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

    public async update({ params, request }: HttpContextContract) {

        const body = request.body()

        const moment = await Moment.findOrFail(params.id)

        moment.title = body.title
        moment.description = body.description

        if (moment.image != body.image || !moment.image) {
            const image = request.file('image', this.validationOptions)

            if (image) {
                const imageName = `${uuidv4()}.${image.extname}`

                await image.move(Application.tmpPath('uploads'), {
                    name: imageName
                })

                moment.image = imageName
            }

            await moment.save()

            return {
                message: "Momento atualizado com sucesso",
                data: moment,
            }
        }
    }


}
