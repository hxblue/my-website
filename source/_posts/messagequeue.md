---
title: "消息队列"
date: 2026-08-03
updated: 2026-08-03
categories:
  - "后端"
tags:
  - "消息队列"
description: "消息队列知识"
cover: /images/covers/cover-12224794.webp
---
# 消息队列


**异步处理**：耗时操作稍后执行；


**系统解耦**：生产者不直接依赖消费者；


**削峰填谷**：请求先进入队列，消费者按照自身能力处理。


消息队列同时会带来消息丢失、重复消费、顺序错乱、消息积压和一致性等问题。


# 安装 Docker desktop


冷知识，docker 在 windows中可以借助 WSL2 技术实现使用 ，docker 底层是基于Linux内核开发的


安装完成


![Docker Desktop 容器列表](/images/posts/messagequeue/01.png)


# 安装MQ


经典先下载镜像


```text
docker pull rabbitmq:4-management
```


![拉取 RabbitMQ 管理版镜像](/images/posts/messagequeue/02.png)


![Docker Desktop 中的 RabbitMQ 镜像](/images/posts/messagequeue/03.png)


```text
docker run -d --hostname rabbitmq-host --name rabbitmq --restart unless-stopped -p 5672:5672 -p 15672:15672 -e RABBITMQ_DEFAULT_USER=mqadmin -e RABBITMQ_DEFAULT_PASS=mqpass123 -v rabbitmq_data:/var/lib/rabbitmq rabbitmq:4-management
```


docker run -d --hostname rabbitmq-host --name rabbitmq --restart unless-stopped -p 5672:5672 -p 15672:15672 -e RABBITMQ_DEFAULT_USER=mqadmin -e RABBITMQ_DEFAULT_PASS=mqpass123 -v rabbitmq_data:/var/lib/rabbitmq rabbitmq:4-management


![启动并检查 RabbitMQ 容器](/images/posts/messagequeue/04.png)


Docker ps 查看一下容器


mqadmin


mqpass123


```text
http://localhost:15672   #后台地址
```


![RabbitMQ 管理台概览](/images/posts/messagequeue/05.png)


5672   Java、Python 程序连接


15672  浏览器管理后台


# 究极小测验


**原生 Java 客户端**完成最小闭环：


Java 发送者 → RabbitMQ 队列 → Java 接收者 ，来看看消息究竟是怎么发出去，存进队列，再被消费者取走的。


## 在IDEA中创建Maven项目


![在 IntelliJ IDEA 中创建 Maven 项目](/images/posts/messagequeue/06.png)


安装依赖


```text
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         https://maven.apache.org/xsd/maven-4.0.0.xsd">

    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>rabbitmq-demo</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <dependency>
            <groupId>com.rabbitmq</groupId>
            <artifactId>amqp-client</artifactId>
            <version>5.33.0</version>
        </dependency>
    </dependencies>

</project>
```


开始发送消息


```text
package com.example.mq;

import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import com.rabbitmq.client.MessageProperties;

import java.nio.charset.StandardCharsets;

public class Send {

    private static final String QUEUE_NAME = "hello";

    public static void main(String[] args) throws Exception {
        ConnectionFactory factory = new ConnectionFactory();

        factory.setHost("localhost");
        factory.setPort(5672);
        factory.setUsername("mqadmin");
        factory.setPassword("mqpass123");

        try (Connection connection = factory.newConnection();
             Channel channel = connection.createChannel()) {

            // 声明持久化、非独占、不自动删除的队列
            channel.queueDeclare(
                    QUEUE_NAME,
                    true,
                    false,
                    false,
                    null
            );

            String message = "Hello RabbitMQ!";

            channel.basicPublish(
                    "",
                    QUEUE_NAME,
                    MessageProperties.PERSISTENT_TEXT_PLAIN,
                    message.getBytes(StandardCharsets.UTF_8)
            );

            System.out.println("消息已发送：" + message);
        }
    }
}
```


![发送消息的 Java 示例及运行结果](/images/posts/messagequeue/07.png)


![RabbitMQ 管理台中的队列列表](/images/posts/messagequeue/08.png)


![接收消息的 Java 示例及运行结果](/images/posts/messagequeue/09.png)


发送消息，等待消息，接受消息、


```text
package com.example.mq;

import com.rabbitmq.client.CancelCallback;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import com.rabbitmq.client.DeliverCallback;

import java.nio.charset.StandardCharsets;

public class Receive {

    private static final String QUEUE_NAME= "hello";

    public static void main(String[] args) throws Exception {
        ConnectionFactory factory = new ConnectionFactory();

        factory.setHost("localhost");
        factory.setPort(5672);
        factory.setUsername("mqadmin");
        factory.setPassword("mqpass123");

        Connection connection = factory.newConnection();
        Channel channel = connection.createChannel();

        // 必须与发送者中的队列参数一致
        channel.queueDeclare(
                QUEUE_NAME,
                true,
                false,
                false,
                null
        );

        System.out.println("消费者已启动，正在等待消息……");

        DeliverCallback deliverCallback = (consumerTag, delivery) -> {
            String message = new String(
                    delivery.getBody(),
                    StandardCharsets.UTF_8
);

            System.out.println("收到消息：" + message);
        };

        CancelCallback cancelCallback = consumerTag ->
                System.out.println("消费者已被取消：" + consumerTag);

        channel.basicConsume(
                QUEUE_NAME,
                true,
                deliverCallback,
                cancelCallback
        );
    }
}
```


![消息消费后的队列状态](/images/posts/messagequeue/10.png)


这里的ready 从刚才的1 变成了 0


```text
生产者发送消息
    ↓
RabbitMQ 将消息存入 hello 队列
    ↓
Ready = 1
    ↓
消费者取走消息
    ↓
Ready = 0
```


```text
channel.basicConsume(
        QUEUE_NAME,
        true,
        deliverCallback,
        cancelCallback
);
```


这里的true  表示自动确认 ， RabbitMQ把消息交给消费者后，就立即认为它处理成功。即使消费者随后在业务执行过程中崩溃，这条消息也可能以及从队列删除


这就需要  手动 ACK ，ACK 就是表示：这条消息我已经真正处理完成，你现在可以删除它了


```text
package com.example.mq;

import com.rabbitmq.client.CancelCallback;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import com.rabbitmq.client.DeliverCallback;

import java.nio.charset.StandardCharsets;

public class Receive {

    private static final String QUEUE_NAME = "hello";

    public static void main(String[] args) throws Exception {
        ConnectionFactory factory = new ConnectionFactory();

        factory.setHost("localhost");
        factory.setPort(5672);
        factory.setUsername("mqadmin");
        factory.setPassword("mqpass123");

        Connection connection = factory.newConnection();
        Channel channel = connection.createChannel();

        channel.queueDeclare(
                QUEUE_NAME,
                true,
                false,
                false,
                null
        );

        /*
         * 同一时间只允许 RabbitMQ 给当前消费者
         * 投递一条尚未确认的消息。
         */
        channel.basicQos(1);

        System.out.println("消费者已启动，正在等待消息……");

        DeliverCallback deliverCallback = (consumerTag, delivery) -> {
            String message = new String(
                    delivery.getBody(),
                    StandardCharsets.UTF_8
            );

            long deliveryTag =
                    delivery.getEnvelope().getDeliveryTag();

            boolean redelivered =
                    delivery.getEnvelope().isRedeliver();

            System.out.println("收到消息：" + message);
            System.out.println("是否为重新投递：" + redelivered);
            System.out.println("开始处理消息……");

            try {
                // 模拟耗时业务，故意等待 10 秒
                Thread.sleep(10_000);

                System.out.println("消息处理完成");

                /*
                 * 确认当前这一条消息。
                 *
                 * deliveryTag：当前消息在该 Channel 中的编号
                 * multiple=false：只确认当前这一条消息
                 */
                channel.basicAck(deliveryTag, false);

                System.out.println("已向 RabbitMQ 发送 ACK");
            } catch (Exception exception) {
                System.out.println("消息处理失败：" + exception.getMessage());

                /*
                 * 拒绝当前消息，并重新放回队列。
                 *
                 * multiple=false：只拒绝当前消息
                 * requeue=true：重新放回队列
                 */
                channel.basicNack(
                        deliveryTag,
                        false,
                        true
                );
            }
        };

        CancelCallback cancelCallback = consumerTag ->
                System.out.println("消费者已取消：" + consumerTag);

        /*
         * autoAck=false，关闭自动确认，改用手动 ACK。
         */
        boolean autoAck = false;

        channel.basicConsume(
                QUEUE_NAME,
                autoAck,
                deliverCallback,
                cancelCallback
        );
    }
}
```


相较于最开始的，进行了以下几个改编

- boolean autoAck = false; 关闭自动确认
- channel.basicAck(deliveryTag, false); 业务真正执行完成后，再确认消息
- channel.basicQos(1); 同一时间，是给当前消费者一条尚未确认的消息
